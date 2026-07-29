import os
import json

# Directories to completely ignore during scanning
IGNORE_DIRS = {
    '.git',
    'node_modules',
    '.next',
    'dist',
    'coverage',
    '__pycache__',
    '.vercel',
    '.turbo',
    'build',
    'out',
    '.idea',
    '.vscode',
    'reports',  # Do not scan our own reports
    '.cache',   # Exclude the SQLite cache folder
}

# File extensions to ignore (mostly binary or non-text files)
IGNORE_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar.gz',
    '.woff', '.woff2', '.ttf', '.eot', '.svg', '.map', '.mp3', '.mp4',
    '.mov', '.wav', '.webp', '.lock', '.tsbuildinfo', '.exe', '.dll',
    '.so', '.dylib', '.sqlite', '.db', '.pck', '.bin', '.gz'
}

# Exact filenames to ignore
IGNORE_FILES = {
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'skills-lock.json',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    '.DS_Store',
    'thumbs.db'
}

# Load pricing models dynamically from pricing.json, with hardcoded fallback
_current_dir = os.path.dirname(os.path.abspath(__file__))
_pricing_path = os.path.join(_current_dir, 'pricing.json')

_FALLBACK_PRICING = {
    "GPT-5.6 Sol": {
        "input_1m": 5.00,
        "output_1m": 30.00,
        "display_name": "GPT-5.6 Sol"
    },
    "GPT-5.6": {
        "input_1m": 10.00,
        "output_1m": 40.00,
        "display_name": "GPT-5.6"
    },
    "GPT-4o": {
        "input_1m": 5.00,
        "output_1m": 15.00,
        "display_name": "GPT-4o"
    },
    "Claude 3.5 Sonnet": {
        "input_1m": 3.00,
        "output_1m": 15.00,
        "display_name": "Claude 3.5 Sonnet"
    }
}

try:
    if os.path.exists(_pricing_path):
        with open(_pricing_path, 'r', encoding='utf-8') as f:
            PRICING_MODELS = json.load(f)
    else:
        PRICING_MODELS = _FALLBACK_PRICING
except Exception:
    PRICING_MODELS = _FALLBACK_PRICING

# Default model if none specified
DEFAULT_MODEL = "GPT-5.6 Sol"

# Mapping from file extensions or names to display languages
LANGUAGE_MAPPING = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.py': 'Python',
    '.sql': 'SQL',
    '.prisma': 'Prisma',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.css': 'CSS',
    '.html': 'HTML',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.sh': 'Shell',
    '.ps1': 'PowerShell',
    '.go': 'Go',
    '.rs': 'Rust',
    '.toml': 'TOML',
    '.xml': 'XML',
    'Dockerfile': 'Docker',
    '.dockerignore': 'Docker',
    '.gitignore': 'Git Configuration',
    'docker-compose.yml': 'Docker'
}

def get_language(filename, extension):
    """
    Determine the display language based on filename or extension.
    """
    if filename in LANGUAGE_MAPPING:
        return LANGUAGE_MAPPING[filename]
    if extension.lower() in LANGUAGE_MAPPING:
        return LANGUAGE_MAPPING[extension.lower()]
    return 'Otros'

def get_content_category(language, filename=None):
    """
    Determine the category (Código, Configuración, Documentación, Infraestructura, Otros)
    based on the language or filename.
    """
    if filename:
        name_lower = filename.lower()
        if 'dockerfile' in name_lower or 'docker-compose' in name_lower:
            return 'Infraestructura'
            
    if language in ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'SQL', 'Shell', 'PowerShell', 'CSS', 'HTML']:
        return 'Código'
    elif language in ['JSON', 'YAML', 'TOML', 'Prisma', 'XML', 'Git Configuration']:
        return 'Configuración'
    elif language in ['Markdown']:
        return 'Documentación'
    elif language in ['Docker']:
        return 'Infraestructura'
        
    if filename and filename.endswith('.txt'):
        return 'Documentación'
        
    return 'Otros'
