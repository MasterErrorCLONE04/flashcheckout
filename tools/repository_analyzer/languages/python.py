import re
from repository_analyzer.languages.base import BaseLanguageAnalyzer

class PythonAnalyzer(BaseLanguageAnalyzer):
    """
    Language analyzer for Python files (.py).
    """
    def strip_comments(self, code):
        """
        Removes comments (#) and docstrings.
        """
        # Remove docstrings: triple quotes
        code = re.sub(r'"""[\s\S]*?"""', '', code)
        code = re.sub(r"'''[\s\S]*?'''", '', code)
        
        # Remove line comments (#)
        cleaned = []
        for line in code.splitlines():
            line_no_comment = re.sub(r'#.*', '', line)
            cleaned.append(line_no_comment)
        return '\n'.join(cleaned)

    def analyze(self, content, file_path):
        cleaned = self.strip_comments(content)
        
        # Count classes, defs, decorators, imports
        classes = len(re.findall(r'\bclass\s+(\w+)', cleaned))
        functions = len(re.findall(r'\bdef\s+(\w+)', cleaned))
        decorators = len(re.findall(r'^\s*@\w+', cleaned, re.MULTILINE))
        imports = len(re.findall(r'\b(?:import\s+[\w, ]+|from\s+[\w.]+\s+import\b)', cleaned))
        
        return {
            'classes': classes,
            'functions': functions,
            'decorators': decorators,
            'imports': imports,
            'modules': 1
        }
