import os

def calculate_readiness_score(total_tokens, file_stats, imports_map, circular_dependencies):
    """
    Computes an AI Agent Readiness Score (0-100) indicating how friendly 
    the codebase is for autonomous AI developers.
    
    Technology-agnostic Categories:
    - Context Window compatibility (30 pts)
    - Code Organization & Module Sizes (30 pts)
    - Dependency Coupling & Circular cycles (20 pts)
    - Documentation presence (20 pts)
    """
    # 1. Context Window Compatibility (Max 30 pts)
    if total_tokens <= 128000:
        context_pts = 30
        context_status = "✔ Excelente (Cabe en 128K)"
        context_mark = "✔"
    elif total_tokens <= 200000:
        context_pts = 25
        context_status = "✔ Excelente (Cabe en 200K)"
        context_mark = "✔"
    elif total_tokens <= 1000000:
        context_pts = 20
        context_status = "⚠ Moderado (Requiere 1M)"
        context_mark = "⚠"
    elif total_tokens <= 2000000:
        context_pts = 15
        context_status = "⚠ Ajustado (Requiere 2M)"
        context_mark = "⚠"
    else:
        context_pts = 10
        context_status = "❌ Crítico (Supera 2M, requiere 10M)"
        context_mark = "❌"
        
    # 2. Code Organization (Max 30 pts)
    # 2.1 File length analysis (15 pts)
    total_files = len(file_stats)
    huge_files = [f for f, s in file_stats.items() if s['lines'] > 1000]
    huge_ratio = len(huge_files) / total_files if total_files else 0
    
    if huge_ratio == 0:
        file_len_pts = 15
    elif huge_ratio < 0.05:
        file_len_pts = 12
    elif huge_ratio < 0.10:
        file_len_pts = 8
    else:
        file_len_pts = 3
        
    # 2.2 Complexity modular density per code file (15 pts)
    # Checks imports, classes, functions, components or decorators
    code_files = [f for f, s in file_stats.items() if s.get('language_metrics')]
    
    total_modular_units = 0
    for s in file_stats.values():
        m = s.get('language_metrics', {})
        # Sum of functions, components, classes, interfaces
        total_modular_units += m.get('functions', 0) + m.get('components', 0) + m.get('classes', 0) + m.get('interfaces', 0)
        
    avg_units = total_modular_units / len(code_files) if code_files else 0
    
    if avg_units < 12:
        func_pts = 15
    elif avg_units < 24:
        func_pts = 10
    else:
        func_pts = 5
        
    complexity_pts = file_len_pts + func_pts
    
    if complexity_pts >= 25:
        architecture_status = "✔ Limpia (Archivos modulares y enfocados)"
        architecture_mark = "✔"
    elif complexity_pts >= 15:
        architecture_status = "⚠ Media (Algunos archivos grandes/complejos)"
        architecture_mark = "⚠"
    else:
        architecture_status = "❌ Compleja (Demasiados archivos gigantes o sobrecargados)"
        architecture_mark = "❌"
        
    # 3. Dependency Coupling (Max 20 pts)
    # Average imports per file (10 pts)
    total_imports = sum(len(imports_map.get(f, [])) for f in code_files)
    avg_imports = total_imports / len(code_files) if code_files else 0
    
    if avg_imports < 6:
        coupling_pts = 10
    elif avg_imports < 12:
        coupling_pts = 8
    elif avg_imports < 20:
        coupling_pts = 5
    else:
        coupling_pts = 2
        
    # Cycles checking (10 pts)
    cycles_count = len(circular_dependencies)
    if cycles_count == 0:
        cycle_pts = 10
    elif cycles_count < 3:
        cycle_pts = 5
    else:
        cycle_pts = 0
        
    dependency_pts = coupling_pts + cycle_pts
    
    if cycles_count == 0:
        dependency_status = "✔ Saludable (Sin dependencias circulares)"
        dependency_mark = "✔"
    else:
        dependency_status = f"⚠ Riesgo ({cycles_count} ciclos circulares detectados)"
        dependency_mark = "⚠"
        
    # 4. Documentation (Max 20 pts)
    # README check (10 pts)
    has_readme = any(os.path.basename(f).lower() == 'readme.md' for f in file_stats)
    readme_pts = 10 if has_readme else 0
    
    # Auxiliary Markdown checking (10 pts)
    md_files = [f for f in file_stats if f.endswith('.md') and os.path.basename(f).lower() != 'readme.md']
    if len(md_files) >= 4:
        md_pts = 10
    elif len(md_files) >= 1:
        md_pts = 5
    else:
        md_pts = 0
        
    doc_pts = readme_pts + md_pts
    
    if doc_pts >= 15:
        doc_status = "✔ Completa (README y guías auxiliares)"
        doc_mark = "✔"
    elif doc_pts >= 5:
        doc_status = "⚠ Básica (README básico, sin guías auxiliares)"
        doc_mark = "⚠"
    else:
        doc_status = "❌ Insuficiente (Falta README o archivos .md)"
        doc_mark = "❌"
        
    # Final Aggregate Score
    final_score = int(context_pts + complexity_pts + dependency_pts + doc_pts)
    
    # Readiness diagnosis advice
    if final_score >= 85:
        level = "Excelente"
        advice = "El código está estructurado, documentado y modularizado. Ideal para automatizaciones de IA sin riesgos."
    elif final_score >= 65:
        level = "Aceptable"
        advice = "El repositorio es apto, pero los archivos grandes o dependencias complejas pueden degradar el contexto de la IA."
    else:
        level = "Crítico"
        advice = "Recomendamos modularizar archivos grandes, corregir ciclos de imports y agregar README.md antes de usar agentes autónomos."
        
    return {
        'score': final_score,
        'level': level,
        'advice': advice,
        'details': {
            'context': {
                'points': context_pts,
                'status': context_status,
                'mark': context_mark
            },
            'architecture': {
                'points': complexity_pts,
                'status': architecture_status,
                'mark': architecture_mark,
                'huge_files_count': len(huge_files),
                'avg_funcs_per_file': avg_units
            },
            'dependencies': {
                'points': dependency_pts,
                'status': dependency_status,
                'mark': dependency_mark,
                'cycles_count': cycles_count,
                'avg_imports_per_file': avg_imports
            },
            'documentation': {
                'points': doc_pts,
                'status': doc_status,
                'mark': doc_mark,
                'has_readme': has_readme,
                'md_files_count': len(md_files) + (1 if has_readme else 0)
            }
        }
    }
