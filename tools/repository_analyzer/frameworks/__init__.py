from repository_analyzer.frameworks.nextjs import analyze_nextjs
from repository_analyzer.frameworks.django import analyze_django
from repository_analyzer.frameworks.springboot import analyze_springboot
from repository_analyzer.frameworks.laravel import analyze_laravel

def analyze_frameworks(project_tags, file_stats, file_contents):
    """
    Examines the codebase tags to compile specific framework structural metrics
    (like routes in Next.js, models in Django, controllers in Laravel/Spring).
    """
    framework_metrics = {}
    
    tags_lower = [tag.lower() for tag in project_tags]
    
    # 1. Next.js
    if 'next.js' in tags_lower or 'nextjs' in tags_lower:
        metrics = analyze_nextjs(file_stats, file_contents)
        if any(metrics.values()):
            framework_metrics['Next.js'] = metrics
            
    # 2. Django
    if 'django' in tags_lower:
        metrics = analyze_django(file_stats, file_contents)
        if any(metrics.values()):
            framework_metrics['Django'] = metrics
            
    # 3. Spring Boot
    if 'spring boot' in tags_lower or 'java' in tags_lower:
        metrics = analyze_springboot(file_stats, file_contents)
        if any(metrics.values()):
            framework_metrics['Spring Boot'] = metrics
            
    # 4. Laravel
    if 'laravel' in tags_lower or 'php' in tags_lower:
        metrics = analyze_laravel(file_stats, file_contents)
        if any(metrics.values()):
            framework_metrics['Laravel'] = metrics
            
    return framework_metrics
