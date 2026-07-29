import re
from repository_analyzer.languages.base import BaseLanguageAnalyzer

class JavaAnalyzer(BaseLanguageAnalyzer):
    """
    Language analyzer for Java files (.java).
    """
    def strip_comments(self, code):
        """
        Removes single-line and block comments.
        """
        code = re.sub(r'/\*[\s\S]*?\*/', '', code)
        cleaned = []
        for line in code.splitlines():
            line_no_comment = re.sub(r'(?<!:)\/\/.*', '', line)
            cleaned.append(line_no_comment)
        return '\n'.join(cleaned)

    def analyze(self, content, file_path):
        cleaned = self.strip_comments(content)
        
        # Classes, Interfaces, Annotations, Packages
        classes = len(re.findall(r'\b(?:public\s+|private\s+|protected\s+)?class\s+(\w+)', cleaned))
        interfaces = len(re.findall(r'\b(?:public\s+|private\s+|protected\s+)?interface\s+(\w+)', cleaned))
        annotations = len(re.findall(r'^\s*@\w+', cleaned, re.MULTILINE))
        
        # Package declarations
        packages = 1 if re.search(r'\bpackage\s+[\w.]+;', cleaned) else 0
        
        return {
            'classes': classes,
            'interfaces': interfaces,
            'annotations': annotations,
            'packages': packages
        }
