import re
import os
from repository_analyzer.languages.base import BaseLanguageAnalyzer

class TypeScriptAnalyzer(BaseLanguageAnalyzer):
    """
    Language analyzer for JavaScript and TypeScript files (.js, .jsx, .ts, .tsx).
    """
    def strip_comments(self, code):
        """
        Removes single-line and block comments.
        """
        # Block comments /* ... */
        code = re.sub(r'/\*[\s\S]*?\*/', '', code)
        
        # Single line comments // ...
        cleaned = []
        for line in code.splitlines():
            line_no_comment = re.sub(r'(?<!:)\/\/.*', '', line)
            cleaned.append(line_no_comment)
        return '\n'.join(cleaned)

    def analyze(self, content, file_path):
        filename = os.path.basename(file_path)
        _, ext = os.path.splitext(filename.lower())
        
        cleaned = self.strip_comments(content)
        
        # Imports and Exports
        imports = len(re.findall(r'\b(?:import\s+.*?from\s+[\'"]|import\s*\(|require\s*\()', cleaned))
        exports = len(re.findall(r'\bexport\b', cleaned))
        
        # Classes, Interfaces, Enums
        classes = len(re.findall(r'\bclass\s+\w+', cleaned))
        interfaces = len(re.findall(r'\binterface\s+\w+', cleaned))
        enums = len(re.findall(r'\benum\s+\w+', cleaned))
        
        # Hooks (useX)
        hooks = len(re.findall(r'\buse[A-Z]\w*\b', cleaned))
        
        # Functions and React Components
        func_decls = re.findall(r'\bfunction\s+(\w+)', cleaned)
        func_arrows = re.findall(r'\b(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>', cleaned)
        
        all_funcs = set(func_decls + func_arrows)
        
        # Method declarations name(...) {
        potential_methods = re.findall(r'\b([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{', cleaned)
        control_keywords = {'if', 'for', 'while', 'switch', 'catch', 'with', 'function', 'constructor', 'super'}
        for m in potential_methods:
            if m not in control_keywords:
                all_funcs.add(m)
                
        components = 0
        functions = 0
        is_react_file = ext in ['.jsx', '.tsx'] or 'React' in cleaned or 'react' in cleaned
        
        for f in all_funcs:
            if f[0].isupper() and f[0].isalpha():
                if is_react_file:
                    components += 1
                else:
                    functions += 1
            else:
                functions += 1
                
        return {
            'components': components,
            'hooks': hooks,
            'functions': functions,
            'classes': classes,
            'interfaces': interfaces,
            'enums': enums,
            'imports': imports,
            'exports': exports
        }
