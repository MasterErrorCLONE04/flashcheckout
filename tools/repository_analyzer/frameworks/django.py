import re

def analyze_django(file_stats, file_contents):
    """
    Analyzes codebase to extract Django architecture metrics:
    - Apps (directories containing apps.py)
    - Models (classes inheriting from Model)
    - Views (views functions/classes)
    - Serializers (classes extending serializers)
    - URLs (occurrences of path/re_path declarations)
    """
    apps = 0
    models = 0
    views = 0
    serializers = 0
    urls = 0
    
    for path, stats in file_stats.items():
        if stats['language'] != 'Python':
            continue
            
        lower_path = path.lower()
        content = file_contents.get(path, "")
        
        # 1. Apps
        if lower_path.endswith('apps.py'):
            apps += 1
            
        # 2. Models
        # Check for model file names or class definitions inheriting from Model
        if lower_path.endswith('models.py') or 'models.Model' in content:
            model_matches = re.findall(r'\bclass\s+\w+\s*\([\w.]*Model\):', content)
            models += len(model_matches) if model_matches else (1 if lower_path.endswith('models.py') else 0)
            
        # 3. Views
        if lower_path.endswith('views.py') or 'views' in lower_path:
            view_funcs = len(re.findall(r'\bdef\s+\w+\s*\(request', content))
            view_classes = len(re.findall(r'\bclass\s+\w+\s*\([\w.]*View\):', content))
            views += view_funcs + view_classes
            
        # 4. Serializers
        if 'serializer' in lower_path:
            serializer_matches = re.findall(r'\bclass\s+\w+\s*\([\w.]*Serializer\):', content)
            serializers += len(serializer_matches) if serializer_matches else (1 if lower_path.endswith('serializers.py') else 0)
            
        # 5. URLs
        if lower_path.endswith('urls.py'):
            url_paths = len(re.findall(r'\b(?:path|re_path)\s*\(', content))
            urls += url_paths
            
    return {
        'Aplicaciones (Apps)': apps,
        'Modelos (Models)': models,
        'Vistas (Views)': views,
        'Serializadores (Serializers)': serializers,
        'Direcciones URL': urls
    }
