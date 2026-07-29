import re
import os

def strip_comments(code):
    """
    Strips single-line and multi-line comments from JS/TS source code
    to avoid running regex patterns on commented-out lines.
    """
    # Remove block comments /* ... */
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    
    # Remove single-line comments // ...
    # We strip // only if it is not preceded by a colon (e.g. to preserve http:// schemas)
    cleaned_lines = []
    for line in code.splitlines():
        line_no_comment = re.sub(r'(?<!:)\/\/.*', '', line)
        cleaned_lines.append(line_no_comment)
        
    return '\n'.join(cleaned_lines)

def analyze_complexity(content, file_path):
    """
    Examines JavaScript and TypeScript code to count:
    - traditional and arrow functions
    - classes
    - interfaces
    - enums
    - React Components (Capitalized functions in UI files)
    - custom/standard hooks (useX)
    - imports and exports
    """
    filename = os.path.basename(file_path)
    _, ext = os.path.splitext(filename.lower())
    
    # Blank metrics default
    metrics = {
        'functions': 0,
        'classes': 0,
        'interfaces': 0,
        'enums': 0,
        'hooks': 0,
        'components': 0,
        'imports': 0,
        'exports': 0,
        'is_code': False
    }
    
    # We only analyze JavaScript / TypeScript files for code intelligence
    if ext not in ['.js', '.jsx', '.ts', '.tsx']:
        return metrics
        
    metrics['is_code'] = True
    
    # Clean the comments first
    cleaned = strip_comments(content)
    
    # 1. Count Imports (either ES6 imports or CommonJS requires)
    import_patterns = r'\b(?:import\s+.*?from\s+[\'"]|import\s*\(|require\s*\()'
    metrics['imports'] = len(re.findall(import_patterns, cleaned))
    
    # 2. Count Exports (ES6 export keywords)
    metrics['exports'] = len(re.findall(r'\bexport\b', cleaned))
    
    # 3. Classes
    metrics['classes'] = len(re.findall(r'\bclass\s+\w+', cleaned))
    
    # 4. Interfaces
    metrics['interfaces'] = len(re.findall(r'\binterface\s+\w+', cleaned))
    
    # 5. Enums
    metrics['enums'] = len(re.findall(r'\benum\s+\w+', cleaned))
    
    # 6. React/Custom Hooks (any word starting with 'use' followed by uppercase letter)
    metrics['hooks'] = len(re.findall(r'\buse[A-Z]\w*\b', cleaned))
    
    # 7. Functions & React Components
    # Traditional function declarations: function name(...)
    func_decls = re.findall(r'\bfunction\s+(\w+)', cleaned)
    
    # Arrow function variables: const name = (...) =>
    func_arrows = re.findall(r'\b(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>', cleaned)
    
    # Gather unique declaration names
    all_funcs = set(func_decls + func_arrows)
    
    # Class methods / object literal functions: name(...) {
    # Exclude control structures to avoid false matching
    potential_methods = re.findall(r'\b([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{', cleaned)
    control_structures = {'if', 'for', 'while', 'switch', 'catch', 'with', 'function', 'constructor', 'super'}
    for m in potential_methods:
        if m not in control_structures:
            all_funcs.add(m)
            
    # Differentiate UI Components from normal utility functions.
    # Capitalized declarations in React files (.jsx/.tsx) or referencing React are marked as components.
    components_count = 0
    functions_count = 0
    
    is_react_context = ext in ['.jsx', '.tsx'] or 'React' in cleaned or 'react' in cleaned
    
    for f in all_funcs:
        if f[0].isupper() and f[0].isalpha():
            if is_react_context:
                components_count += 1
            else:
                functions_count += 1
        else:
            functions_count += 1
            
    metrics['components'] = components_count
    metrics['functions'] = functions_count
    
    return metrics

def get_complexity_rating(stats):
    """
    Assigns a simple descriptive complexity rating (Baja, Media, Alta)
    based on the total count of functions, classes, and components.
    """
    score = stats.get('functions', 0) + (stats.get('components', 0) * 2) + (stats.get('classes', 0) * 3)
    if score > 60:
        return 'Alta'
    elif score > 20:
        return 'Media'
    return 'Baja'
