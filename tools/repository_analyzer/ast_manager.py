import os
import subprocess
import json
import sys

def resolve_import_path(source_path, current_file, base_dir):
    """
    Resolves an import source string (e.g. "@/lib/prisma", "../checkout/orders", "stripe")
    to a workspace-relative file path if internal, or marks it as external.
    """
    is_external = True
    resolved_file = source_path
    
    # Normalize source path
    source_path = source_path.replace('\\', '/')
    
    # Check if alias or relative
    is_internal = source_path.startswith(('@/', './', '../')) or (
        # For Python: check if the first segment is a top-level directory in the workspace
        not source_path.startswith('.') and 
        os.path.exists(os.path.join(base_dir, source_path.split('/')[0]))
    )
    
    if is_internal:
        is_external = False
        # Resolve aliases
        if source_path.startswith('@/'):
            rel_target = source_path[2:]
        elif source_path.startswith(('.', '..')):
            current_dir = os.path.dirname(current_file)
            rel_target = os.path.normpath(os.path.join(current_dir, source_path)).replace('\\', '/')
        else:
            rel_target = source_path
            
        # Try extensions
        possible_paths = [
            rel_target,
            rel_target + '.ts',
            rel_target + '.tsx',
            rel_target + '.js',
            rel_target + '.jsx',
            rel_target + '.py',
            rel_target + '/index.ts',
            rel_target + '/index.tsx',
            rel_target + '/index.js'
        ]
        
        for p in possible_paths:
            # Strip leading slashes
            p = p.lstrip('/')
            full_check = os.path.join(base_dir, p)
            if os.path.exists(full_check) and os.path.isfile(full_check):
                resolved_file = p
                break
            elif os.path.exists(full_check) and os.path.isdir(full_check):
                index_check = os.path.join(full_check, 'index.ts')
                if os.path.exists(index_check):
                    resolved_file = os.path.join(p, 'index.ts')
                    break
                    
    return {
        "source": source_path,
        "resolved_file": resolved_file,
        "is_external": is_external
    }

def parse_file_ast(file_path, base_dir):
    """
    Parses any TS/JS or Python file and returns a unified AST representation:
    """
    full_path = os.path.join(base_dir, file_path)
    ext = os.path.splitext(file_path)[1].lower()
    
    empty_result = {
        "file": file_path,
        "classes": [],
        "functions": [],
        "imports": [],
        "exports": [],
        "symbols": [],
        "references": [],
        "types": [],
        "routes": [],
        "models": []
    }
    
    if not os.path.exists(full_path):
        return empty_result
        
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    if ext in ['.ts', '.tsx', '.js', '.jsx']:
        parser_script = os.path.join(script_dir, 'ast_ts_parser.js')
        cmd = ['node', parser_script, full_path]
    elif ext == '.py':
        parser_script = os.path.join(script_dir, 'ast_py_parser.py')
        cmd = ['python3', parser_script, full_path]
    else:
        return empty_result
        
    try:
        # Run subprocess with a reasonable timeout of 5 seconds
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=5,
            errors='ignore'
        )
        if res.returncode == 0:
            data = json.loads(res.stdout)
            if 'error' in data:
                return empty_result
                
            resolved_imports = []
            for imp in data.get('imports', []):
                resolved = resolve_import_path(imp.get('source', ''), file_path, base_dir)
                resolved_imports.append({
                    "source": imp.get('source', ''),
                    "resolved_file": resolved["resolved_file"],
                    "is_external": resolved["is_external"],
                    "symbols": imp.get('symbols', [])
                })
                
            return {
                "file": file_path,
                "classes": data.get('classes', []),
                "functions": data.get('functions', []),
                "imports": resolved_imports,
                "exports": data.get('exports', []),
                "symbols": [],
                "references": [],
                "types": [],
                "routes": [],
                "models": []
            }
        else:
            return empty_result
    except Exception:
        return empty_result
