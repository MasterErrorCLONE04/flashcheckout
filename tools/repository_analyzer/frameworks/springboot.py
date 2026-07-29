import re

def analyze_springboot(file_stats, file_contents):
    """
    Analyzes codebase to extract Spring Boot MVC metrics:
    - Controllers (@RestController, @Controller annotations)
    - Services (@Service annotations)
    - Repositories (@Repository annotations or extended Repository interfaces)
    - Entities (@Entity, @Table annotations)
    """
    controllers = 0
    services = 0
    repositories = 0
    entities = 0
    
    for path, stats in file_stats.items():
        if stats['language'] != 'Java':
            continue
            
        content = file_contents.get(path, "")
        
        # 1. Controllers
        if '@RestController' in content or '@Controller' in content:
            controllers += 1
            
        # 2. Services
        if '@Service' in content:
            services += 1
            
        # 3. Repositories
        if '@Repository' in content or 'extends JpaRepository' in content or 'extends CrudRepository' in content:
            repositories += 1
            
        # 4. Entities
        if '@Entity' in content or '@Table' in content:
            entities += 1
            
    return {
        'Controladores (Controllers)': controllers,
        'Servicios (Services)': services,
        'Repositorios (Repositories)': repositories,
        'Entidades (Entities)': entities
    }
