import re
from repository_analyzer.languages.base import BaseLanguageAnalyzer

class PHPAnalyzer(BaseLanguageAnalyzer):
    """
    Language analyzer for PHP files (.php).
    """
    def strip_comments(self, code):
        """
        Removes single-line (// or #) and block (/* */) comments.
        """
        code = re.sub(r'/\*[\s\S]*?\*/', '', code)
        cleaned = []
        for line in code.splitlines():
            line_no_comment = re.sub(r'(?<!:)(?:\/\/|#).*', '', line)
            cleaned.append(line_no_comment)
        return '\n'.join(cleaned)

    def analyze(self, content, file_path):
        cleaned = self.strip_comments(content)
        
        # Classes, Interfaces, Functions, Namespaces
        classes = len(re.findall(r'\bclass\s+(\w+)', cleaned))
        interfaces = len(re.findall(r'\binterface\s+(\w+)', cleaned))
        functions = len(re.findall(r'\bfunction\s+(\w+)', cleaned))
        namespaces = 1 if re.search(r'\bnamespace\s+[\w\\]+;', cleaned) else 0
        
        return {
            'classes': classes,
            'interfaces': interfaces,
            'functions': functions,
            'namespaces': namespaces
        }
