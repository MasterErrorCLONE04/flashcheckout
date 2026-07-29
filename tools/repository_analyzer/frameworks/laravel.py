import os

def analyze_laravel(file_stats, file_contents):
    """
    Analyzes codebase to extract Laravel PHP framework metrics:
    - Controllers (filenames ending in Controller.php)
    - Models (classes extending Model or located in app/Models/)
    - Routes (files under routes/ directory)
    - Migrations (files under database/migrations/ directory)
    - Middleware (files under app/Http/Middleware/ directory)
    """
    controllers = 0
    models = 0
    routes = 0
    migrations = 0
    middleware = 0
    
    for path, stats in file_stats.items():
        if stats['language'] != 'PHP':
            continue
            
        lower_path = path.lower()
        filename = os.path.basename(path)
        content = file_contents.get(path, "")
        
        # 1. Controllers
        if filename.endswith('Controller.php'):
            controllers += 1
            
        # 2. Models
        if 'app/models/' in lower_path or 'extends model' in content.lower():
            models += 1
            
        # 3. Routes
        if 'routes/' in lower_path and filename.endswith('.php'):
            routes += 1
            
        # 4. Migrations
        if 'database/migrations/' in lower_path and filename.endswith('.php'):
            migrations += 1
            
        # 5. Middleware
        if 'app/http/middleware/' in lower_path and filename.endswith('.php'):
            middleware += 1
            
    return {
        'Controladores (Controllers)': controllers,
        'Modelos (Models)': models,
        'Rutas (Routes)': routes,
        'Migraciones (Migrations)': migrations,
        'Middleware': middleware
    }
