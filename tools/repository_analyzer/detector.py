import os

def detect_project_type(base_dir):
    """
    Examines the root directory of the workspace to auto-detect project types,
    frameworks, and database layers, returning a list of descriptive tags.
    """
    tags = []
    
    # Node.js
    if os.path.exists(os.path.join(base_dir, 'package.json')):
        tags.append("Node.js")
        
    # TypeScript
    if os.path.exists(os.path.join(base_dir, 'tsconfig.json')):
        tags.append("TypeScript")
        
    # Python
    python_indicators = ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile']
    if any(os.path.exists(os.path.join(base_dir, ind)) for ind in python_indicators):
        tags.append("Python")
        
    # Rust
    if os.path.exists(os.path.join(base_dir, 'Cargo.toml')):
        tags.append("Rust")
        
    # Go
    if os.path.exists(os.path.join(base_dir, 'go.mod')):
        tags.append("Go")
        
    # Java
    java_indicators = ['pom.xml', 'build.gradle', 'settings.gradle']
    if any(os.path.exists(os.path.join(base_dir, ind)) for ind in java_indicators):
        tags.append("Java")
        
    # Prisma ORM
    prisma_indicators = [
        os.path.join('prisma', 'schema.prisma'),
        'schema.prisma',
        'prisma.config.ts'
    ]
    if any(os.path.exists(os.path.join(base_dir, ind)) for ind in prisma_indicators):
        tags.append("Prisma ORM")
        
    # Next.js
    next_indicators = ['next.config.js', 'next.config.ts', 'next.config.mjs']
    if any(os.path.exists(os.path.join(base_dir, ind)) for ind in next_indicators):
        tags.append("Next.js")
        
    # Docker
    if os.path.exists(os.path.join(base_dir, 'docker-compose.yml')) or os.path.exists(os.path.join(base_dir, 'Dockerfile')):
        tags.append("Docker")
        
    if not tags:
        tags.append("Genérico")
        
    return tags
