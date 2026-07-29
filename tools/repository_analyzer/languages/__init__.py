from repository_analyzer.languages.typescript import TypeScriptAnalyzer
from repository_analyzer.languages.python import PythonAnalyzer
from repository_analyzer.languages.java import JavaAnalyzer
from repository_analyzer.languages.php import PHPAnalyzer

# Map extensions to analyzer instances
_registry = {
    '.ts': TypeScriptAnalyzer(),
    '.tsx': TypeScriptAnalyzer(),
    '.js': TypeScriptAnalyzer(),
    '.jsx': TypeScriptAnalyzer(),
    '.py': PythonAnalyzer(),
    '.java': JavaAnalyzer(),
    '.php': PHPAnalyzer()
}

def get_language_analyzer(extension):
    """
    Returns the appropriate language analyzer based on file extension.
    Returns None if no matching analyzer is registered.
    """
    return _registry.get(extension.lower())
