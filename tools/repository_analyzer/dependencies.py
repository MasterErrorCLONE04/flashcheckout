import re
import os

def build_dependency_graph(file_contents, workspace_files):
    """
    Parses import statements in the workspace files to build a static dependency graph.
    - file_contents: dictionary of {rel_path: content_string}
    - workspace_files: set of all relative file paths in the workspace
    
    Returns:
    - imports_map: {file: list of files it imports}
    - dependents_map: {file: list of files that import it}
    """
    imports_map = {f: [] for f in workspace_files}
    dependents_map = {f: [] for f in workspace_files}
    
    # Heuristic regex to match imports: import, require, dynamic import
    # Matches strings in double or single quotes
    import_regex = re.compile(
        r'\b(?:import\s+.*?from\s+[\'"](?P<p1>.*?)[\'"]|import\s*\([\'"](?P<p2>.*?)[\'"]\)|require\s*\([\'"](?P<p3>.*?)[\'"]\))'
    )
    
    for rel_path, content in file_contents.items():
        filename = os.path.basename(rel_path)
        _, ext = os.path.splitext(filename.lower())
        
        # Only parse JavaScript and TypeScript files
        if ext not in ['.js', '.jsx', '.ts', '.tsx']:
            continue
            
        # Extract raw import strings
        raw_imports = []
        for m in import_regex.finditer(content):
            p = m.group('p1') or m.group('p2') or m.group('p3')
            if p:
                raw_imports.append(p)
                
        # Resolve target files in workspace
        for imp in raw_imports:
            # 1. Skip absolute third-party library imports (e.g. 'react', 'next/link')
            if not (imp.startswith('.') or imp.startswith('@/') or imp.startswith('~/')):
                continue
                
            resolved_target = None
            
            # 2. Resolve Next.js/TypeScript path aliases (@/* or ~/*)
            if imp.startswith('@/') or imp.startswith('~/'):
                # Replace prefix to point relative to root
                resolved_target = imp[2:]
            # 3. Resolve relative path imports (./ or ../)
            elif imp.startswith('.'):
                folder = os.path.dirname(rel_path)
                resolved_target = os.path.normpath(os.path.join(folder, imp)).replace(os.sep, '/')
                
            if not resolved_target:
                continue
                
            # 4. Try extensions candidates to find the actual workspace file
            candidates = [
                resolved_target,
                resolved_target + '.tsx',
                resolved_target + '.ts',
                resolved_target + '.jsx',
                resolved_target + '.js',
                resolved_target + '/index.tsx',
                resolved_target + '/index.ts',
                resolved_target + '/index.jsx',
                resolved_target + '/index.js'
            ]
            
            for candidate in candidates:
                if candidate in workspace_files:
                    # Found a valid internal dependency!
                    if candidate not in imports_map[rel_path]:
                        imports_map[rel_path].append(candidate)
                    if rel_path not in dependents_map[candidate]:
                        dependents_map[candidate].append(rel_path)
                    break
                    
    return imports_map, dependents_map

def calculate_recursive_impact(node, dependents_map):
    """
    Breadth-first search traversal to count how many files recursively import / depend on this file.
    Represents the 'blast radius' or impact size of changing the file.
    """
    visited = set()
    queue = [node]
    
    while queue:
        current = queue.pop(0)
        for dep in dependents_map.get(current, []):
            if dep not in visited and dep != node:
                visited.add(dep)
                queue.append(dep)
                
    return len(visited), list(visited)

def find_circular_dependencies(imports_map):
    """
    Runs a Depth-First Search (DFS) cycle-detection algorithm on the imports mapping.
    Returns a list of cycle loops found (e.g. [['A.ts', 'B.ts', 'A.ts']]).
    """
    visited = {}  # 0: unvisited, 1: visiting, 2: visited
    cycles = []
    
    def dfs(node, path):
        visited[node] = 1  # visiting
        path.append(node)
        
        for neighbor in imports_map.get(node, []):
            if visited.get(neighbor, 0) == 1:
                # Cycle detected! Find starting node in current path
                try:
                    idx = path.index(neighbor)
                    cycle = path[idx:] + [neighbor]
                    # Avoid adding identical cycles starting at different steps
                    normalized_cycle = sorted(cycle[:-1])
                    if normalized_cycle not in [sorted(c[:-1]) for c in cycles]:
                        cycles.append(cycle)
                except ValueError:
                    pass
            elif visited.get(neighbor, 0) == 0:
                dfs(neighbor, path)
                
        path.pop()
        visited[node] = 2  # visited
        
    for node in imports_map:
        if visited.get(node, 0) == 0:
            dfs(node, [])
            
    return cycles
