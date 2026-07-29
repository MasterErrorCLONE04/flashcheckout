import re

def analyze_nextjs(file_stats, file_contents):
    """
    Analyzes codebase to extract Next.js metrics:
    - Page Routes (files under app/**/page.tsx or pages/**/*.tsx)
    - API Routes (files under app/api/**/route.ts or pages/api/**/*.ts)
    - Server Components (files in app/ without 'use client')
    """
    page_routes = 0
    api_routes = 0
    server_components = 0
    
    for path, stats in file_stats.items():
        if stats['language'] not in ['TypeScript', 'JavaScript']:
            continue
            
        lower_path = path.lower()
        
        # 1. API Routes
        if 'app/api/' in lower_path and (lower_path.endswith('route.ts') or lower_path.endswith('route.js')):
            api_routes += 1
        elif 'pages/api/' in lower_path and (lower_path.endswith('.ts') or lower_path.endswith('.js') or lower_path.endswith('.tsx') or lower_path.endswith('.jsx')):
            api_routes += 1
        
        # 2. Page Routes
        elif ('/page.tsx' in lower_path or '/page.js' in lower_path) and 'app/' in lower_path:
            page_routes += 1
        elif 'pages/' in lower_path and (lower_path.endswith('.tsx') or lower_path.endswith('.jsx') or lower_path.endswith('.js') or lower_path.endswith('.ts')):
            # Exclude special pages: _app, _document, and api folder
            filename = lower_path.split('/')[-1]
            if filename not in ['_app.tsx', '_app.js', '_document.tsx', '_document.js']:
                page_routes += 1
                
        # 3. Server Components
        # Next.js App Router components are Server Components by default unless they declare "use client"
        if 'app/' in lower_path and (lower_path.endswith('.tsx') or lower_path.endswith('.ts')):
            content = file_contents.get(path, "")
            if 'use client' not in content and "use client" not in content:
                # Exclude routes definitions, layout definitions, styles, test files
                filename = lower_path.split('/')[-1]
                if not (filename.startswith('route.') or filename.startswith('layout.') or filename.startswith('page.') or filename.startswith('loading.') or filename.startswith('error.')):
                    server_components += 1
                    
    return {
        'Rutas de Página': page_routes,
        'Rutas de API': api_routes,
        'Server Components': server_components
    }
