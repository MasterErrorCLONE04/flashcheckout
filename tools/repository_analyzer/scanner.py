import os
from repository_analyzer.config import IGNORE_DIRS, IGNORE_EXTENSIONS, IGNORE_FILES

def scan_files(base_dir, custom_ignores=None):
    """
    Recursively scans the directory to find code and configuration files,
    filtering out directories, extensions, and exact filenames defined in the configuration.
    
    Modifies the list of subdirectories in-place during traversal for performance.
    """
    files_to_analyze = []
    
    # Combine default ignores with any custom ignores provided
    ignored_dirs = set(IGNORE_DIRS)
    if custom_ignores:
        for item in custom_ignores:
            ignored_dirs.add(item)
            
    base_dir = os.path.abspath(base_dir)
    
    for root, dirs, files in os.walk(base_dir):
        # Modify dirs in-place to prevent os.walk from entering ignored directories.
        # We also ignore directories starting with '.' (except for specific cases if needed,
        # but standard hidden directories like .next, .git, etc. are already covered or ignored).
        dirs[:] = [d for d in dirs if d not in ignored_dirs and not (d.startswith('.') and d not in ['.github', '.agents'])]
        
        for file in files:
            # Skip common hidden files unless they are explicit config files we care about
            if file.startswith('.') and file not in ['.gitignore', '.dockerignore', '.env.example']:
                continue
                
            # Skip exact filenames matching the ignore list
            if file in IGNORE_FILES:
                continue
                
            # Get extension
            _, ext = os.path.splitext(file)
            
            # Skip ignored extensions
            if ext.lower() in IGNORE_EXTENSIONS:
                continue
                
            full_path = os.path.join(root, file)
            
            # Safety check: make sure no parent directory of the file was ignored
            # (especially when scanning a subdirectory of an ignored folder directly)
            rel_path = os.path.relpath(full_path, base_dir)
            path_parts = rel_path.split(os.sep)
            if any(part in ignored_dirs for part in path_parts[:-1]):
                continue
                
            files_to_analyze.append(full_path)
            
    return files_to_analyze
