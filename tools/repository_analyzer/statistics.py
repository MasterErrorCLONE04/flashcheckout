import os
import sys
import subprocess
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor
from repository_analyzer.config import get_language, get_content_category
from repository_analyzer.tokenizer import count_tokens
from repository_analyzer.cache import (
    get_cached_file_by_mtime,
    get_cached_file_by_hash,
    save_cached_file_batch
)
from repository_analyzer.languages import get_language_analyzer
from repository_analyzer.frameworks import analyze_frameworks
from repository_analyzer.detector import detect_project_type
from repository_analyzer.dependencies import (
    build_dependency_graph,
    calculate_recursive_impact,
    find_circular_dependencies
)
from repository_analyzer.readiness import calculate_readiness_score
from repository_analyzer.pricing import get_pricing_info

def calculate_sha256(content):
    """
    Calculate the SHA-256 hash of a string.
    """
    return hashlib.sha256(content.encode('utf-8', errors='replace')).hexdigest()

def process_file_worker(item):
    """
    Parallel worker task to read, hash, analyze, and parse a file using Language Analyzers.
    """
    file_path, rel_path, size, mtime = item
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception:
        return None
        
    sha256 = calculate_sha256(content)
    filename = os.path.basename(file_path)
    _, ext = os.path.splitext(filename.lower())
    lang = get_language(filename, ext)
    
    # Try a secondary check: query cache by SHA-256 hash
    cached = get_cached_file_by_hash(rel_path, sha256)
    if cached is not None:
        return {
            'rel_path': rel_path,
            'sha256': sha256,
            'size': size,
            'mtime': mtime,
            'extension': ext,
            'language': lang,
            'lines': cached['lines'],
            'characters': cached['characters'],
            'tokens': cached['tokens'],
            'imports': cached.get('imports', 0),
            'exports': cached.get('exports', 0),
            'language_metrics': cached.get('language_metrics', {}),
            'cached': True,
            'update_metadata': True
        }
        
    # Full analysis (Cache Miss)
    lines = len(content.splitlines())
    chars = len(content)
    tokens = count_tokens(content)
    
    # Get custom language metrics via registered plugin
    analyzer = get_language_analyzer(ext)
    lang_metrics = {}
    if analyzer:
        try:
            lang_metrics = analyzer.analyze(content, file_path)
        except Exception:
            pass
            
    return {
        'rel_path': rel_path,
        'sha256': sha256,
        'size': size,
        'mtime': mtime,
        'extension': ext,
        'language': lang,
        'lines': lines,
        'characters': chars,
        'tokens': tokens,
        'imports': lang_metrics.get('imports', 0),
        'exports': lang_metrics.get('exports', 0),
        'language_metrics': lang_metrics,
        'cached': False,
        'update_metadata': True
    }

def analyze_file(file_path, base_dir):
    """
    Analyzes a single file (reads, hashes, checks cache, tokenizes, runs language analyzer).
    Used by Git Task Analyzer for uncommitted change analysis.
    """
    rel_path = os.path.relpath(file_path, base_dir).replace(os.sep, '/')
    try:
        stat_info = os.stat(file_path)
        size = stat_info.st_size
        mtime = int(stat_info.st_mtime)
    except Exception:
        return None
        
    # Check cache by mtime
    cached = get_cached_file_by_mtime(rel_path, size, mtime)
    if cached is not None:
        return {
            'lines': cached['lines'],
            'characters': cached['characters'],
            'tokens': cached['tokens'],
            'sha256': cached['sha256'],
            'language': cached['language'],
            'language_metrics': cached.get('language_metrics', {}),
            'cached': True
        }
        
    # Process
    res = process_file_worker((file_path, rel_path, size, mtime))
    if res:
        # Save cache entry immediately
        from repository_analyzer.cache import save_cached_file
        save_cached_file(
            rel_path,
            res['sha256'],
            res['size'],
            res['mtime'],
            res['extension'],
            res['language'],
            res['lines'],
            res['characters'],
            res['tokens'],
            res['imports'],
            res['exports'],
            res['language_metrics']
        )
        return {
            'lines': res['lines'],
            'characters': res['characters'],
            'tokens': res['tokens'],
            'sha256': res['sha256'],
            'language': res['language'],
            'language_metrics': res['language_metrics'],
            'cached': res['cached']
        }
    return None

def build_folder_tree(file_stats):
    """
    Build a tree representation of token counts for directories.
    Returns a dictionary of folder path to token count.
    """
    folder_tokens = {}
    
    for rel_path, stats in file_stats.items():
        tokens = stats['tokens']
        parts = rel_path.split('/')
        
        # Add to parent directories
        for i in range(len(parts)):
            parent_parts = parts[:i]
            if not parent_parts:
                parent_dir = '.'
            else:
                parent_dir = '/'.join(parent_parts)
                
            folder_tokens[parent_dir] = folder_tokens.get(parent_dir, 0) + tokens
            
    return folder_tokens

def calculate_statistics(files, base_dir, model_name=None, incremental=False):
    """
    Scan all files using multi-threaded execution and SQLite caching.
    Aggregates statistics by language, folders, and content categories.
    Compiles dependency graphs, circular imports, complexity counts, and readiness score.
    """
    file_stats = {}
    language_stats = {}
    category_stats = {}
    
    total_files = 0
    total_lines = 0
    total_chars = 0
    total_tokens = 0
    cache_hits = 0
    
    # Retrieve pricing model to calculate folder costs dynamically
    pricing_cfg = get_pricing_info(model_name)
    input_1m = pricing_cfg['input_1m']
    
    # 1. First Pass: Check SQLite cache using modification time and file size
    files_to_process = []
    
    for file_path in files:
        rel_path = os.path.relpath(file_path, base_dir).replace(os.sep, '/')
        filename = os.path.basename(file_path)
        _, ext = os.path.splitext(filename.lower())
        lang = get_language(filename, ext)
        
        try:
            stat_info = os.stat(file_path)
            size = stat_info.st_size
            mtime = int(stat_info.st_mtime)
        except Exception:
            continue
            
        cached = get_cached_file_by_mtime(rel_path, size, mtime)
        if cached is not None:
            # mtime Cache Hit!
            stats = {
                'lines': cached['lines'],
                'characters': cached['characters'],
                'tokens': cached['tokens'],
                'sha256': cached['sha256'],
                'language': lang,
                'imports': cached.get('imports', 0),
                'exports': cached.get('exports', 0),
                'language_metrics': cached.get('language_metrics', {}),
                'cached': True
            }
            file_stats[rel_path] = stats
            cache_hits += 1
        else:
            # Cache Miss (or modified file).
            files_to_process.append((file_path, rel_path, size, mtime))
            
    # 2. Second Pass: Run non-cached files through Parallel Thread Pool
    cache_records_to_save = []
    incremental_changes = []
    
    if files_to_process:
        max_workers = min(8, len(files_to_process))
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = executor.map(process_file_worker, files_to_process)
            
            for res in results:
                if res is None:
                    continue
                    
                rel_path = res['rel_path']
                stats = {
                    'lines': res['lines'],
                    'characters': res['characters'],
                    'tokens': res['tokens'],
                    'sha256': res['sha256'],
                    'language': res['language'],
                    'imports': res['imports'],
                    'exports': res['exports'],
                    'language_metrics': res['language_metrics'],
                    'cached': res['cached']
                }
                
                file_stats[rel_path] = stats
                if res['cached']:
                    cache_hits += 1
                else:
                    incremental_changes.append(rel_path)
                    
                # Queue metadata updates to SQLite cache
                if res.get('update_metadata'):
                    import json
                    lang_metrics_str = json.dumps(res['language_metrics'] or {})
                    cache_records_to_save.append((
                        rel_path,
                        res['sha256'],
                        res['size'],
                        res['mtime'],
                        res['extension'],
                        res['language'],
                        res['lines'],
                        res['characters'],
                        res['tokens'],
                        res['imports'],
                        res['exports'],
                        lang_metrics_str
                    ))
                    
        # Batch insert all new caching records in a single SQLite transaction
        if cache_records_to_save:
            save_cached_file_batch(cache_records_to_save)
            
    # 3. Read JS/TS imports contents to compile static dependency graph
    file_contents = {}
    for rel_path, stats in file_stats.items():
        if stats['language'] in ['TypeScript', 'JavaScript']:
            abs_path = os.path.join(base_dir, rel_path)
            try:
                with open(abs_path, 'r', encoding='utf-8', errors='replace') as f:
                    file_contents[rel_path] = f.read()
            except Exception:
                pass
                
    imports_map, dependents_map = build_dependency_graph(file_contents, set(file_stats.keys()))
    circular_deps = find_circular_dependencies(imports_map)
    
    # 4. Aggregations, Impact scores, and Pluggable complexity totals
    language_complexity = {}
    
    for rel_path, stats in file_stats.items():
        lang = stats['language']
        category = get_content_category(lang, os.path.basename(rel_path))
        
        # Calculate impact score
        impact, _ = calculate_recursive_impact(rel_path, dependents_map)
        stats['impact_score'] = impact
        
        # Dynamic complexity aggregation by language
        lmetrics = stats.get('language_metrics', {})
        if lmetrics:
            if lang not in language_complexity:
                language_complexity[lang] = {}
            for k, v in lmetrics.items():
                if isinstance(v, (int, float)):
                    language_complexity[lang][k] = language_complexity[lang].get(k, 0) + v
            
        # Language Aggregation
        if lang not in language_stats:
            language_stats[lang] = {'files': 0, 'lines': 0, 'characters': 0, 'tokens': 0}
        language_stats[lang]['files'] += 1
        language_stats[lang]['lines'] += stats['lines']
        language_stats[lang]['characters'] += stats['characters']
        language_stats[lang]['tokens'] += stats['tokens']
        
        # Category Aggregation
        if category not in category_stats:
            category_stats[category] = {'files': 0, 'lines': 0, 'characters': 0, 'tokens': 0}
        category_stats[category]['files'] += 1
        category_stats[category]['lines'] += stats['lines']
        category_stats[category]['characters'] += stats['characters']
        category_stats[category]['tokens'] += stats['tokens']
        
        # Grand Totals
        total_files += 1
        total_lines += stats['lines']
        total_chars += stats['characters']
        total_tokens += stats['tokens']
        
    # Percentages for languages
    for lang, lstats in language_stats.items():
        lstats['percentage'] = (lstats['tokens'] / total_tokens * 100) if total_tokens > 0 else 0.0
        
    # Percentages for categories
    sorted_categories = []
    for cat, cstats in category_stats.items():
        cstats['percentage'] = (cstats['tokens'] / total_tokens * 100) if total_tokens > 0 else 0.0
        cstats['cost'] = (cstats['tokens'] / 1000000.0) * input_1m
        sorted_categories.append((cat, cstats))
        
    sorted_categories = sorted(sorted_categories, key=lambda x: x[1]['tokens'], reverse=True)
    
    sorted_languages = sorted(
        language_stats.items(),
        key=lambda item: item[1]['tokens'],
        reverse=True
    )
    
    # Folder Token counts and costs
    folder_tree = build_folder_tree(file_stats)
    sorted_folders_raw = sorted(
        [(folder, tokens) for folder, tokens in folder_tree.items() if folder != '.'],
        key=lambda item: item[1],
        reverse=True
    )
    
    sorted_folders = []
    for folder, tokens in sorted_folders_raw:
        cost = (tokens / 1000000.0) * input_1m
        sorted_folders.append((folder, tokens, cost))
        
    # Calculate readiness score
    readiness = calculate_readiness_score(total_tokens, file_stats, imports_map, circular_deps)
    
    # Detect project tags and compile framework metrics
    project_tags = detect_project_type(base_dir)
    framework_metrics = analyze_frameworks(project_tags, file_stats, file_contents)
    
    # Complexity folder rating aggregates
    complexity_folder_summary = {}
    for folder, tokens in folder_tree.items():
        folder_funcs = 0
        folder_comps = 0
        folder_classes = 0
        file_count = 0
        
        for path, fstats in file_stats.items():
            parent = os.path.dirname(path)
            if parent == folder or (parent == "" and folder == "."):
                file_count += 1
                m = fstats.get('language_metrics', {})
                folder_funcs += m.get('functions', 0)
                folder_comps += m.get('components', 0)
                folder_classes += m.get('classes', 0)
                
        if file_count > 0:
            # Descriptive rating calculation
            score = folder_funcs + (folder_comps * 2) + (folder_classes * 3)
            if score > 60:
                rating = 'Alta'
            elif score > 20:
                rating = 'Media'
            else:
                rating = 'Baja'
            complexity_folder_summary[folder] = {
                'rating': rating
            }
            
    return {
        'summary': {
            'files': total_files,
            'lines': total_lines,
            'characters': total_chars,
            'tokens': total_tokens,
            'cache_hits': cache_hits,
            'cache_misses': total_files - cache_hits
        },
        'files': file_stats,
        'languages': sorted_languages,
        'categories': sorted_categories,
        'folders': sorted_folders,
        'folder_raw_tree': folder_tree,
        'folder_complexity': complexity_folder_summary,
        'incremental_changes': incremental_changes,
        'language_complexity': language_complexity,
        'framework_metrics': framework_metrics,
        'dependencies': {
            'imports_map': imports_map,
            'dependents_map': dependents_map,
            'circular': circular_deps
        },
        'readiness': readiness
    }

def run_git_command(args, cwd):
    """
    Run a git command and return stdout.
    """
    try:
        result = subprocess.run(
            args,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except (subprocess.SubprocessError, FileNotFoundError):
        return None

def analyze_git_work(base_dir):
    """
    Analyzes git uncommitted changes and outputs task telemetry.
    """
    git_dir = run_git_command(['git', 'rev-parse', '--show-toplevel'], base_dir)
    if not git_dir:
        return None
        
    status_output = run_git_command(['git', 'status', '--porcelain'], base_dir)
    if status_output is None:
        return None
        
    modified_files = []
    new_files = []
    deleted_files = []
    
    for line in status_output.splitlines():
        if len(line) < 4:
            continue
        status = line[:2]
        path = line[3:].strip()
        
        abs_path = os.path.join(base_dir, path)
        rel_path = os.path.relpath(abs_path, base_dir).replace(os.sep, '/')
        
        if 'M' in status:
            modified_files.append(rel_path)
        elif '?' in status or 'A' in status:
            if rel_path.startswith('reports/') or rel_path.startswith('tools/'):
                continue
            new_files.append(rel_path)
        elif 'D' in status:
            deleted_files.append(rel_path)
            
    numstat_output = run_git_command(['git', 'diff', '--numstat'], base_dir)
    lines_added = 0
    lines_deleted = 0
    if numstat_output:
        for line in numstat_output.splitlines():
            parts = line.split()
            if len(parts) >= 2:
                try:
                    lines_added += int(parts[0])
                    lines_deleted += int(parts[1])
                except ValueError:
                    pass
                    
    affected_tokens = 0
    output_tokens = 0
    
    for rel_path in modified_files:
        full_path = os.path.join(base_dir, rel_path)
        stats = analyze_file(full_path, base_dir)
        if stats:
            affected_tokens += stats['tokens']
            
    for rel_path in new_files:
        full_path = os.path.join(base_dir, rel_path)
        stats = analyze_file(full_path, base_dir)
        if stats:
            affected_tokens += stats['tokens']
            output_tokens += stats['tokens']
            
    diff_output = run_git_command(['git', 'diff'], base_dir)
    if diff_output:
        added_lines = []
        for line in diff_output.splitlines():
            if line.startswith('+') and not line.startswith('+++'):
                added_lines.append(line[1:])
        added_text = '\n'.join(added_lines)
        diff_added_tokens = count_tokens(added_text)
        output_tokens += diff_added_tokens
        
    total_changed = len(modified_files) + len(new_files) + len(deleted_files)
    if total_changed == 0:
        return {
            'active': False,
            'message': 'No se detectaron cambios sin confirmar en Git (Working directory limpio).'
        }
        
    return {
        'active': True,
        'files_read': len(modified_files),
        'files_modified': len(modified_files),
        'files_new': len(new_files),
        'files_deleted': len(deleted_files),
        'lines_added': lines_added,
        'lines_deleted': lines_deleted,
        'affected_tokens': affected_tokens,
        'input_tokens': affected_tokens,
        'output_tokens': output_tokens,
        'modified_list': modified_files,
        'new_list': new_files,
        'deleted_list': deleted_files
    }
