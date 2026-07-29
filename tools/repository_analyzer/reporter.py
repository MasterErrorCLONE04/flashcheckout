import os
import json
import csv
import time
from repository_analyzer.pricing import (
    calculate_costs,
    calculate_agent_cost,
    get_pricing_info,
    calculate_agent_scenarios
)
from repository_analyzer.cache import get_snapshots

def format_number(val):
    """
    Format numbers with dots as thousands separator (e.g. 1.086.223).
    """
    if isinstance(val, int):
        return f"{val:,}".replace(",", ".")
    elif isinstance(val, float):
        parts = f"{val:,.2f}".split('.')
        parts[0] = parts[0].replace(",", ".")
        return ".".join(parts)
    return str(val)

def check_context_windows(tokens):
    """
    Check if the token count fits within standard LLM context windows.
    """
    windows = [
        ("128K (GPT-4 / Claude)", 128000),
        ("200K (Claude 3/3.5)", 200000),
        ("1M (Gemini 1.5 Pro)", 1000000),
        ("2M (Gemini 1.5 Pro)", 2000000),
        ("10M (Gemini custom)", 10000000)
    ]
    return [(label, tokens <= limit) for label, limit in windows]

def print_console(stats, git_stats, model_name, durations, project_tags):
    """
    Print a beautiful Spanish-formatted report to the CLI console.
    Adapts structurally based on detected Language Analyzers and Frameworks.
    """
    summary = stats['summary']
    costs = calculate_costs(summary['tokens'], model_name)
    scenarios = calculate_agent_scenarios(summary['tokens'], model_name)
    readiness = stats['readiness']
    circular = stats['dependencies']['circular']
    
    print("\n" + "═" * 48)
    print("  FlashCheckouts Repository Analyzer (Fase 3)")
    print("═" * 48)
    
    # Project tags
    print(f"Proyecto detectado: {', '.join(project_tags)}")
    print("─" * 48)
    
    # AI Readiness Score
    print(f"AI Readiness Score: {readiness['score']}/100 ({readiness['level']})")
    print(f"  Estrategia: {readiness['advice']}")
    print("─" * 48)
    
    print("Proyecto")
    print("─" * 48)
    print(f"Archivos............... {format_number(summary['files'])}")
    print(f"Líneas................ {format_number(summary['lines'])}")
    print(f"Caracteres............ {format_number(summary['characters'])}")
    print(f"Tokens (o200k)........ {format_number(summary['tokens'])}")
    print(f"Caché (Hits/Misses)... {format_number(summary['cache_hits'])} / {format_number(summary['cache_misses'])}")
    
    # Language Complexity
    lang_comp = stats.get('language_complexity', {})
    if lang_comp:
        print("\nEstructura y Complejidad por Lenguaje")
        print("─" * 48)
        for lang, metrics in lang_comp.items():
            print(f"[{lang}]")
            for k, v in metrics.items():
                display_key = k.replace('_', ' ').title()
                print(f"  {display_key:22} {format_number(v)}")
                
    # Framework Metrics
    fw_metrics = stats.get('framework_metrics', {})
    if fw_metrics:
        print("\nMétricas de Frameworks Especializados")
        print("─" * 48)
        for fw, metrics in fw_metrics.items():
            print(f"[{fw}]")
            for k, v in metrics.items():
                print(f"  {k:22} {format_number(v)}")
                
    # Categories
    print("\nCategorías de Contenido")
    print("─" * 48)
    for cat, cstats in stats['categories']:
        padding = 24 - len(cat)
        print(f"{cat}{'.' * padding} {cstats['percentage']:.0f}% ({format_number(cstats['tokens'])} tokens, USD {format_number(cstats['cost'])})")
        
    print("\nTop carpetas")
    print("─" * 48)
    for folder, tokens, cost in stats['folders'][:5]:
        display_folder = folder if folder.endswith('/') else f"{folder}/"
        padding = 24 - len(display_folder)
        if padding < 1:
            padding = 1
        comp_rating = stats['folder_complexity'].get(folder, {}).get('rating', 'Baja')
        print(f"{display_folder}{'.' * padding} {format_number(tokens)} tokens (USD {format_number(cost)}) [{comp_rating}]")
        
    # Circular dependencies alert
    if circular:
        print("\n⚠️ Dependencias Circulares Detectadas!")
        print("─" * 48)
        for i, cycle in enumerate(circular[:3]):
            print(f"  ➜ {' ➔ '.join(cycle[-3:])}")
        if len(circular) > 3:
            print(f"  ... y {len(circular) - 3} ciclos más.")
            
    print(f"\nCoste estimado {costs['model_name']} (Lectura única)")
    print("─" * 48)
    print(f"Leer una vez............. USD {format_number(costs['read_1'])}")
    print(f"Leer cinco veces......... USD {format_number(costs['read_5'])}")
    
    # Scenarios Table
    print(f"\nEscenarios de Agentes ({costs['model_name']})")
    print("─" * 48)
    print(f"Agente Explorador (1xIn, 10%Out).... USD {format_number(scenarios['explorer']['cost'])}")
    print(f"Agente Desarrollador (2xIn, 50%Out).. USD {format_number(scenarios['developer']['cost'])}")
    print(f"Agente Autónomo (5xIn, 100%Out)..... USD {format_number(scenarios['autonomous']['cost'])}")
    
    # Context Windows check
    print("\nContext Windows")
    print("─" * 48)
    for label, fits in check_context_windows(summary['tokens']):
        icon = "✔" if fits else "❌"
        short_label = label.split()[0]
        padding = 24 - len(short_label)
        print(f"{short_label}{'.' * padding} {icon}")
        
    # Historical timeline summary
    snapshots = get_snapshots()
    if len(snapshots) > 1:
        print("\nHistorial de Crecimiento")
        print("─" * 48)
        for snap in snapshots[-5:]:
            print(f"  {snap['date']} ➜ {format_number(snap['files'])} archs, {format_number(snap['tokens'])} tokens (USD {snap['cost']:.2f})")
            
    # Performance timers
    print("\nTiempo de análisis")
    print("─" * 48)
    print(f"Escaneo.................. {durations.get('scan', 0.0):.3f} s")
    print(f"Tokenización (paralela).. {durations.get('tokenize', 0.0):.3f} s")
    print(f"Reportes................. {durations.get('report', 0.0):.3f} s")
    print(f"Total.................... {durations.get('total', 0.0):.3f} s")
    
    # Git Task Analyzer
    if git_stats and git_stats.get('active'):
        agent_cost = calculate_agent_cost(git_stats['input_tokens'], git_stats['output_tokens'], model_name)
        
        print("\n" + "═" * 48)
        print("  Git Task Analyzer (Cambios sin confirmar)")
        print("═" * 48)
        print(f"Archivos modificados.... {format_number(git_stats['files_modified'])}")
        print(f"Archivos nuevos......... {format_number(git_stats['files_new'])}")
        print(f"Líneas added/deleted.... +{format_number(git_stats['lines_added'])} / -{format_number(git_stats['lines_deleted'])}")
        print(f"Tokens afectados........ {format_number(git_stats['affected_tokens'])}")
        print("Estimación agente:")
        print(f"  Entrada (Contexto).... {format_number(git_stats['input_tokens'])} tokens")
        print(f"  Salida (Escritura).... {format_number(git_stats['output_tokens'])} tokens")
        print(f"Costo estimado ({model_name}).. USD {format_number(agent_cost['total_cost'])}")
        
    print("\n" + "═" * 48)

def save_json(stats, git_stats, file_path, durations, project_tags):
    """
    Save the statistics, durations, and project tags to a JSON report.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    report_data = {
        'project': {
            'tags': project_tags,
            'detected_at': time.strftime("%Y-%m-%d %H:%M:%S")
        },
        'summary': stats['summary'],
        'durations': durations,
        'readiness': stats['readiness'],
        'language_complexity': stats.get('language_complexity', {}),
        'framework_metrics': stats.get('framework_metrics', {}),
        'categories': {cat: {'files': cstats['files'], 'tokens': cstats['tokens'], 'cost': cstats['cost'], 'percentage': cstats['percentage']} for cat, cstats in stats['categories']},
        'languages': {lang: lstats for lang, lstats in stats['languages']},
        'folders': stats['folders'],
        'circular_dependencies': stats['dependencies']['circular'],
        'git_work': git_stats if git_stats else {'active': False},
        'files': {
            path: {
                'language': fstats['language'],
                'lines': fstats['lines'],
                'characters': fstats['characters'],
                'tokens': fstats['tokens'],
                'cached': fstats.get('cached', False),
                'impact_score': fstats.get('impact_score', 0),
                'language_metrics': fstats.get('language_metrics', {})
            } for path, fstats in stats['files'].items()
        }
    }
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

def save_csv(stats, file_path, model_name):
    """
    Save file-level metrics (including code complexity and dependencies) to a CSV spreadsheet.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    pricing_cfg = get_pricing_info(model_name)
    input_1m = pricing_cfg['input_1m']
    
    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Ruta de Archivo', 'Lenguaje', 'Categoría', 'Líneas', 'Caracteres', 'Tokens', 
            'Costo Lectura USD', 'Impacto (Blast Radius)', 'Componentes', 'Funciones', 
            'Hooks', 'Clases', 'Imports', 'Exports'
        ])
        
        from repository_analyzer.config import get_content_category
        for rel_path, fstats in sorted(stats['files'].items()):
            cost = (fstats['tokens'] / 1000000.0) * input_1m
            cat = get_content_category(fstats['language'], os.path.basename(rel_path))
            lmetrics = fstats.get('language_metrics', {})
            writer.writerow([
                rel_path,
                fstats['language'],
                cat,
                fstats['lines'],
                fstats['characters'],
                fstats['tokens'],
                f"{cost:.6f}",
                fstats.get('impact_score', 0),
                lmetrics.get('components', 0),
                lmetrics.get('functions', 0),
                lmetrics.get('hooks', 0),
                lmetrics.get('classes', 0),
                lmetrics.get('imports', 0),
                lmetrics.get('exports', 0)
            ])

def save_markdown(stats, git_stats, file_path, model_name, durations, project_tags):
    """
    Generate a professional Markdown report detailing codebase complexity, dependencies, and readiness score.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    summary = stats['summary']
    costs = calculate_costs(summary['tokens'], model_name)
    scenarios = calculate_agent_scenarios(summary['tokens'], model_name)
    readiness = stats['readiness']
    circular = stats['dependencies']['circular']
    
    md = []
    md.append(f"# Repository Analysis Report: {project_tags[0] if project_tags else 'FlashCheckout'}")
    md.append(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    md.append("")
    
    md.append("## Project Detection Tags")
    md.append(", ".join([f"`{tag}`" for tag in project_tags]))
    md.append("")
    
    md.append(f"## AI Agent Readiness Diagnosis")
    md.append(f"### **Ready Score: {readiness['score']}/100 ({readiness['level']})**")
    md.append(f"> {readiness['advice']}")
    md.append("")
    md.append("| Evaluation Category | Diagnostics Check | Details |")
    md.append("| --- | --- | --- |")
    md.append(f"| **Context Window Compatibility** | {readiness['details']['context']['mark']} | {readiness['details']['context']['status']} |")
    md.append(f"| **Architecture & File Sizes** | {readiness['details']['architecture']['mark']} | {readiness['details']['architecture']['status']} |")
    md.append(f"| **Dependency Coupling & Loops** | {readiness['details']['dependencies']['mark']} | {readiness['details']['dependencies']['status']} |")
    md.append(f"| **Documentation & Guidelines** | {readiness['details']['documentation']['mark']} | {readiness['details']['documentation']['status']} |")
    md.append("")
    
    # Modular Code Intelligence Sections
    lang_comp = stats.get('language_complexity', {})
    if lang_comp:
        md.append("## Estructura y Complejidad por Lenguaje")
        for lang, metrics in lang_comp.items():
            md.append(f"### Lenguaje: {lang}")
            md.append("| Métrica | Conteo Total |")
            md.append("| --- | --- |")
            for k, v in metrics.items():
                display_key = k.replace('_', ' ').title()
                md.append(f"| **{display_key}** | {format_number(v)} |")
            md.append("")
            
    fw_metrics = stats.get('framework_metrics', {})
    if fw_metrics:
        md.append("## Estructura y Componentes de Frameworks")
        for fw, metrics in fw_metrics.items():
            md.append(f"### Framework: {fw}")
            md.append("| Componente / Ruta | Conteo Total |")
            md.append("| --- | --- |")
            for k, v in metrics.items():
                md.append(f"| **{k}** | {format_number(v)} |")
            md.append("")
            
    if circular:
        md.append("### ⚠️ Circular Dependency Cycles Detected")
        for i, cycle in enumerate(circular[:10]):
            md.append(f"- **Ciclo {i+1}**: {' ➔ '.join(cycle)}")
        if len(circular) > 10:
            md.append(f"- ... y {len(circular) - 10} ciclos de importación más.")
        md.append("")
        
    md.append("## General Codebase Statistics")
    md.append("| Metric | Count | Details |")
    md.append("| --- | --- | --- |")
    md.append(f"| **Files** | {format_number(summary['files'])} | Relevant text files analyzed |")
    md.append(f"| **Lines** | {format_number(summary['lines'])} | Total lines of code/text |")
    md.append(f"| **Characters** | {format_number(summary['characters'])} | Total text size |")
    md.append(f"| **Tokens (o200k)** | {format_number(summary['tokens'])} | Input tokens weight |")
    md.append(f"| **Cache Hits** | {format_number(summary['cache_hits'])} | Skipped due to SQLite cache |")
    md.append("")
    
    md.append("## Category Breakdown")
    md.append("| Category | Files | Tokens | Share | Est. Cost |")
    md.append("| --- | --- | --- | --- | --- |")
    for cat, cstats in stats['categories']:
        md.append(f"| {cat} | {cstats['files']} | {format_number(cstats['tokens'])} | {cstats['percentage']:.1f}% | USD {format_number(cstats['cost'])} |")
    md.append("")
    
    md.append(f"## Scenarios for AI Agents ({costs['model_name']})")
    md.append("| Scenario | Input Context | Output Generated | Cost (USD) | Description |")
    md.append("| --- | --- | --- | --- | --- |")
    md.append(f"| **Agente Explorador** | {format_number(scenarios['explorer']['input'])} (100%) | {format_number(scenarios['explorer']['output'])} (10%) | USD {format_number(scenarios['explorer']['cost'])} | Basic scanning / code reviews |")
    md.append(f"| **Agente Desarrollador** | {format_number(scenarios['developer']['input'])} (200%) | {format_number(scenarios['developer']['output'])} (50%) | USD {format_number(scenarios['developer']['cost'])} | Standard feature builds |")
    md.append(f"| **Agente Autónomo** | {format_number(scenarios['autonomous']['input'])} (500%) | {format_number(scenarios['autonomous']['output'])} (100%) | USD {format_number(scenarios['autonomous']['cost'])} | Iterative loops and rewrites |")
    md.append("")
    
    md.append("## Dependency Impact Analysis (Top 10 Files)")
    md.append("| File Path | Language | Recursive Dependents (Impact Score) |")
    md.append("| --- | --- | --- |")
    sorted_by_impact = sorted(stats['files'].items(), key=lambda x: x[1].get('impact_score', 0), reverse=True)[:10]
    for path, fstats in sorted_by_impact:
        if fstats.get('impact_score', 0) > 0:
            md.append(f"| `{path}` | {fstats['language']} | **{fstats['impact_score']} archivos** |")
    md.append("")
    
    snapshots = get_snapshots()
    if snapshots:
        md.append("## Historical Snapshot Timeline")
        md.append("| Date | Total Files | Lines of Code | Total Tokens | Estimated Cost (USD) |")
        md.append("| --- | --- | --- | --- | --- |")
        for snap in snapshots:
            md.append(f"| {snap['date']} | {snap['files']} | {format_number(snap['lines'])} | {format_number(snap['tokens'])} | USD {snap['cost']:.2f} |")
        md.append("")
        
    if git_stats and git_stats.get('active'):
        agent_cost = calculate_agent_cost(git_stats['input_tokens'], git_stats['output_tokens'], model_name)
        md.append("## Git Task Analyzer (Uncommitted Changes)")
        md.append(f"- **Modified Files**: {git_stats['files_modified']}")
        md.append(f"- **New Files**: {git_stats['files_new']}")
        md.append(f"- **Lines Added/Deleted**: +{format_number(git_stats['lines_added'])} / -{format_number(git_stats['lines_deleted'])}")
        md.append(f"- **Estimated Task Cost ({model_name})**: **USD {format_number(agent_cost['total_cost'])}**")
        md.append("")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

def save_html(stats, git_stats, file_path, model_name, durations, project_tags):
    """
    Save a premium HTML report displaying beautiful interactive timelines, 
    code intelligence details, circular cycles tables, and agent score gauges.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    summary = stats['summary']
    costs = calculate_costs(summary['tokens'], model_name)
    scenarios = calculate_agent_scenarios(summary['tokens'], model_name)
    readiness = stats['readiness']
    circular = stats['dependencies']['circular']
    
    # Calculate costs for multiple models to make the dashboard comparative
    comparative_costs = {}
    for m_name in ['GPT-5.6 Sol', 'GPT-5.6', 'GPT-4o', 'Claude 3.5 Sonnet']:
        comparative_costs[m_name] = calculate_costs(summary['tokens'], m_name)
        
    git_work_card = ""
    if git_stats and git_stats.get('active'):
        agent_cost = calculate_agent_cost(git_stats['input_tokens'], git_stats['output_tokens'], model_name)
        git_work_card = f"""
        <div class="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg shadow-indigo-500/5 mb-6">
            <div class="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl"></div>
            <div class="flex items-center space-x-3 mb-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold tracking-tight text-indigo-100">Git Task Analyzer</h2>
            </div>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 mb-4">
                <div class="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
                    <span class="text-xs text-slate-400 block mb-1">Modificados</span>
                    <span class="text-xl font-semibold text-yellow-400">{git_stats['files_modified']}</span>
                </div>
                <div class="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
                    <span class="text-xs text-slate-400 block mb-1">Nuevos</span>
                    <span class="text-xl font-semibold text-emerald-400">{git_stats['files_new']}</span>
                </div>
                <div class="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
                    <span class="text-xs text-slate-400 block mb-1">Líneas Diff</span>
                    <span class="text-xl font-semibold text-sky-400">+{format_number(git_stats['lines_added'])} / -{format_number(git_stats['lines_deleted'])}</span>
                </div>
                <div class="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
                    <span class="text-xs text-slate-400 block mb-1">Tokens Entrada</span>
                    <span class="text-xl font-semibold text-indigo-300">{format_number(git_stats['input_tokens'])}</span>
                </div>
                <div class="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
                    <span class="text-xs text-slate-400 block mb-1">Tokens Salida</span>
                    <span class="text-xl font-semibold text-purple-300">{format_number(git_stats['output_tokens'])}</span>
                </div>
                <div class="rounded-xl bg-slate-950/40 p-4 border border-indigo-500/20 bg-indigo-950/10">
                    <span class="text-xs text-indigo-300 block mb-1">Costo Estimado</span>
                    <span class="text-xl font-bold text-pink-400">USD {format_number(agent_cost['total_cost'])}</span>
                </div>
            </div>
            
            <div class="mt-4 border-t border-slate-800/80 pt-3">
                <span class="text-xs text-slate-400 font-semibold block mb-2">Archivos Modificados / Creados:</span>
                <div class="max-h-[120px] overflow-y-auto scrollbar-custom text-slate-300 text-xs font-mono space-y-1">
                    {"".join([f'<div class="flex items-center space-x-2"><span class="h-1.5 w-1.5 rounded-full bg-yellow-400"></span><span>{f}</span></div>' for f in git_stats['modified_list']])}
                    {"".join([f'<div class="flex items-center space-x-2"><span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span><span>{f} [NUEVO]</span></div>' for f in git_stats['new_list']])}
                </div>
            </div>
        </div>
        """

    # Generate circular dependency cards
    circular_cards = ""
    if circular:
        circular_cards = f"""
        <div class="bg-glass border border-red-500/20 bg-red-950/5 rounded-2xl p-6 mb-6">
            <h3 class="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Ciclos de Dependencias Circulares Detectados ({len(circular)})</span>
            </h3>
            <div class="max-h-[180px] overflow-y-auto scrollbar-custom text-slate-300 text-xs font-mono space-y-1.5 pr-2">
                {"".join([f'<div class="bg-slate-950/40 p-2.5 rounded-lg border border-red-500/10 flex items-center"><span class="text-red-400 font-bold mr-2">Ciclo {i+1}:</span><span class="text-slate-200">{" ➔ ".join(cycle)}</span></div>' for i, cycle in enumerate(circular)])}
            </div>
        </div>
        """

    # Renders comparative charts parameters
    lang_labels = [item[0] for item in stats['languages']]
    lang_tokens = [item[1]['tokens'] for item in stats['languages']]
    
    cat_labels = [item[0] for item in stats['categories']]
    cat_tokens = [item[1]['tokens'] for item in stats['categories']]
    
    folder_labels = [item[0] for item in stats['folders'][:8]]
    folder_tokens = [item[1] for item in stats['folders'][:8]]
    
    # Process snapshots historical list
    snapshots = get_snapshots()
    snapshot_dates = [snap['date'] for snap in snapshots]
    snapshot_tokens = [snap['tokens'] for snap in snapshots]
    snapshot_cost = [snap['cost'] for snap in snapshots]
    
    # Generate dynamic Code Intelligence HTML cards
    code_intel_html = ""
    lang_comp = stats.get('language_complexity', {})
    fw_metrics = stats.get('framework_metrics', {})
    
    if lang_comp or fw_metrics:
        code_intel_html += '<div class="space-y-6">'
        
        # Languages metrics
        for lang, metrics in lang_comp.items():
            code_intel_html += f"""
            <div class="bg-glass border border-slate-800 rounded-2xl p-6 shadow-md">
                <h3 class="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 border-b border-slate-800/80 pb-2">Estructura Código: {lang}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            """
            for k, v in metrics.items():
                display_key = k.replace('_', ' ').title()
                code_intel_html += f"""
                    <div class="bg-slate-950/20 p-3.5 rounded-xl border border-slate-800/80">
                        <span class="text-[10px] text-slate-400 block mb-1 uppercase font-semibold tracking-wider">{display_key}</span>
                        <span class="text-xl font-bold tracking-tight text-slate-200">{format_number(v)}</span>
                    </div>
                """
            code_intel_html += """
                </div>
            </div>
            """
            
        # Frameworks metrics
        for framework, metrics in fw_metrics.items():
            code_intel_html += f"""
            <div class="bg-glass border border-indigo-500/20 bg-gradient-to-b from-indigo-950/10 to-transparent rounded-2xl p-6 shadow-lg">
                <h3 class="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4 border-b border-indigo-500/10 pb-2">Estructura Framework: {framework}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            """
            for k, v in metrics.items():
                code_intel_html += f"""
                    <div class="bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/60">
                        <span class="text-[10px] text-indigo-300 block mb-1 uppercase font-semibold tracking-wider">{k}</span>
                        <span class="text-xl font-bold tracking-tight text-white">{format_number(v)}</span>
                    </div>
                """
            code_intel_html += """
                </div>
            </div>
            """
            
        code_intel_html += '</div>'
    else:
        # Default placeholder card
        code_intel_html = """
        <div class="bg-glass border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No se detectaron métricas estructurales para los archivos escaneados.
        </div>
        """
        
    def get_color_for_index(idx):
        colors = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#64748B']
        return colors[idx % len(colors)]
        
    tags_html = "".join([f'<span class="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold">{tag}</span>' for tag in project_tags])
    
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlashCheckouts - Code Intelligence Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    fontFamily: {{
                        sans: ['Outfit', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }},
                    colors: {{
                        dark: {{
                            950: '#030712',
                            900: '#0F172A',
                            800: '#1E293B',
                            700: '#334155',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        .glow-indigo {{
            text-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }}
        .bg-glass {{
            background: rgba(30, 41, 59, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }}
        .scrollbar-custom::-webkit-scrollbar {{
            width: 6px;
            height: 6px;
        }}
        .scrollbar-custom::-webkit-scrollbar-track {{
            background: rgba(15, 23, 42, 0.3);
        }}
        .scrollbar-custom::-webkit-scrollbar-thumb {{
            background: rgba(100, 116, 139, 0.4);
            border-radius: 4px;
        }}
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {{
            background: rgba(100, 116, 139, 0.6);
        }}
    </style>
</head>
<body class="bg-dark-950 text-slate-100 min-h-screen overflow-x-hidden pb-12 selection:bg-indigo-500/30 selection:text-indigo-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/80 pb-6">
            <div>
                <span class="text-xs font-semibold tracking-widest text-indigo-400 uppercase">FlashCheckouts (Fase 3)</span>
                <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent glow-indigo mb-2">
                    Repository Analyzer
                </h1>
                <div class="flex flex-wrap gap-2 mt-1">
                    {tags_html}
                </div>
            </div>
            <div class="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs text-slate-400">Modelo Activo: <strong class="text-indigo-300 font-semibold">{costs['model_name']}</strong></span>
            </div>
        </header>

        <!-- Main Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            
            <!-- Files -->
            <div class="bg-glass border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition duration-350 shadow-md">
                <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Archivos</span>
                <span class="text-2xl font-bold tracking-tight text-white">{format_number(summary['files'])}</span>
            </div>

            <!-- Lines -->
            <div class="bg-glass border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition duration-350 shadow-md">
                <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Líneas</span>
                <span class="text-2xl font-bold tracking-tight text-white">{format_number(summary['lines'])}</span>
            </div>

            <!-- Tokens -->
            <div class="bg-glass border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-transparent rounded-2xl p-4 hover:border-indigo-500/35 transition duration-350 shadow-lg shadow-indigo-500/5">
                <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Tokens (o200k)</span>
                <span class="text-2xl font-black tracking-tight text-white">{format_number(summary['tokens'])}</span>
            </div>

            <!-- Cache Hits -->
            <div class="bg-glass border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition duration-350 shadow-md">
                <span class="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Caché SQLite Hits</span>
                <span class="text-2xl font-bold tracking-tight text-sky-400">{format_number(summary.get('cache_hits', 0))}</span>
            </div>

            <!-- AI Readiness score card -->
            <div class="bg-glass border border-indigo-500/30 bg-gradient-to-r from-indigo-950/10 to-purple-950/10 rounded-2xl p-4 shadow-md col-span-2 lg:col-span-1">
                <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">AI Agent Readiness</span>
                <span class="text-2xl font-black tracking-tight text-indigo-300">{readiness['score']}/100</span>
                <span class="text-[10px] text-slate-400 block font-medium mt-1">{readiness['level']} score</span>
            </div>
        </div>

        <!-- Git Task Dashboard -->
        {git_work_card}
        
        <!-- Circular dependencies warning -->
        {circular_cards}
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Left Side: Interactive Charts -->
            <div class="lg:col-span-8 space-y-6">
                
                <!-- Dynamic Code Intelligence Section -->
                {code_intel_html}

                <!-- Snapshot History Chart -->
                {f"""
                <div class="bg-glass border border-slate-800 rounded-2xl p-6">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Historial de Crecimiento del Repositorio</h3>
                    <div class="relative" style="height: 240px;">
                        <canvas id="snapshotChart"></canvas>
                    </div>
                </div>
                """ if len(snapshots) > 1 else ""}

                <!-- Chart: Language Share & Category Share -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-glass border border-slate-800 rounded-2xl p-6">
                        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Distribución por Lenguaje</h3>
                        <div class="relative flex items-center justify-center" style="height: 220px;">
                            <canvas id="languageChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-glass border border-slate-800 rounded-2xl p-6">
                        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Distribución por Categorías</h3>
                        <div class="relative flex items-center justify-center" style="height: 220px;">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Folders Horizontal Bar -->
                <div class="bg-glass border border-slate-800 rounded-2xl p-6">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Tokens por Módulo (Top 8)</h3>
                    <div class="relative flex items-center justify-center" style="height: 240px;">
                        <canvas id="foldersChart"></canvas>
                    </div>
                </div>

            </div>

            <!-- Right Side: Details Tables -->
            <div class="lg:col-span-4 space-y-6">
                
                <!-- Readiness Score Diagnostics Card -->
                <div class="bg-glass border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-transparent rounded-2xl p-5 shadow-lg">
                    <h3 class="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 border-b border-indigo-500/20 pb-2">Diagnóstico de Agentes</h3>
                    <div class="space-y-3 mb-4">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-slate-300">Contexto ({readiness['details']['context']['points']}/30)</span>
                            <span class="font-semibold text-slate-200">{readiness['details']['context']['mark']}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-slate-300">Arquitectura ({readiness['details']['architecture']['points']}/30)</span>
                            <span class="font-semibold text-slate-200">{readiness['details']['architecture']['mark']}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-slate-300">Dependencias ({readiness['details']['dependencies']['points']}/20)</span>
                            <span class="font-semibold text-slate-200">{readiness['details']['dependencies']['mark']}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-slate-300">Documentación ({readiness['details']['documentation']['points']}/20)</span>
                            <span class="font-semibold text-slate-200">{readiness['details']['documentation']['mark']}</span>
                        </div>
                    </div>
                    <div class="border-t border-slate-800/80 pt-3">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estrategia</span>
                        <p class="text-xs text-slate-300 leading-relaxed">{readiness['advice']}</p>
                    </div>
                </div>

                <!-- Timing Card -->
                <div class="bg-glass border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Tiempo de Análisis</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-950/20 p-3 rounded-xl border border-slate-800/80">
                            <span class="text-xs text-slate-400 block mb-1">Escaneo</span>
                            <span class="text-sm font-bold text-slate-200">{durations.get('scan', 0.0):.3f} s</span>
                        </div>
                        <div class="bg-slate-950/20 p-3 rounded-xl border border-slate-800/80">
                            <span class="text-xs text-slate-400 block mb-1">Tokenización</span>
                            <span class="text-sm font-bold text-slate-200">{durations.get('tokenize', 0.0):.3f} s</span>
                        </div>
                        <div class="bg-slate-950/20 p-3 rounded-xl border border-slate-800/80">
                            <span class="text-xs text-slate-400 block mb-1">Reportes</span>
                            <span class="text-sm font-bold text-slate-200">{durations.get('report', 0.0):.3f} s</span>
                        </div>
                        <div class="bg-indigo-950/10 p-3 rounded-xl border border-indigo-500/20 col-span-1">
                            <span class="text-xs text-indigo-300 block mb-1">Tiempo Total</span>
                            <span class="text-sm font-black text-indigo-400">{durations.get('total', 0.0):.3f} s</span>
                        </div>
                    </div>
                </div>

                <!-- Table: Cost scenarios for active model -->
                <div class="bg-glass border border-slate-800 rounded-2xl p-5">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Escenarios Agente ({costs['model_name']})</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/80">
                            <div>
                                <span class="text-xs text-slate-200 block font-semibold">Agente Explorador</span>
                                <span class="text-[10px] text-slate-400">1x Input, 10% Output</span>
                            </div>
                            <span class="text-base font-bold text-indigo-300">USD {format_number(scenarios['explorer']['cost'])}</span>
                        </div>
                        <div class="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/80">
                            <div>
                                <span class="text-xs text-slate-200 block font-semibold">Agente Desarrollador</span>
                                <span class="text-[10px] text-slate-400">2x Input, 50% Output</span>
                            </div>
                            <span class="text-base font-bold text-purple-300">USD {format_number(scenarios['developer']['cost'])}</span>
                        </div>
                        <div class="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/80">
                            <div>
                                <span class="text-xs text-slate-200 block font-semibold">Agente Autónomo</span>
                                <span class="text-[10px] text-slate-400">5x Input, 100% Output</span>
                            </div>
                            <span class="text-base font-bold text-pink-300">USD {format_number(scenarios['autonomous']['cost'])}</span>
                        </div>
                    </div>
                </div>

                <!-- Languages Distribution list card -->
                <div class="bg-glass border border-slate-800 rounded-2xl p-5">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Porcentaje por Lenguaje</h3>
                    <div class="space-y-2 max-h-[220px] overflow-y-auto scrollbar-custom pr-1">
                        {"".join([f"""
                        <div class="flex justify-between items-center text-xs py-1">
                            <span class="text-slate-200 font-medium flex items-center space-x-1.5">
                                <span class="h-2 w-2 rounded-full" style="background-color: {get_color_for_index(i)}"></span>
                                <span>{lang}</span>
                            </span>
                            <span class="text-slate-400 font-mono font-semibold">{format_number(lstats['tokens'])} tkn ({lstats['percentage']:.1f}%)</span>
                        </div>
                        """ for i, (lang, lstats) in enumerate(stats['languages'])])}
                    </div>
                </div>

            </div>

        </div>

        <!-- Section: Top Folders Cost Allocation & Complexity -->
        <div class="mt-6 bg-glass border border-slate-800 rounded-2xl p-6">
            <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Distribución de Costes y Complejidad por Módulo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {"".join([f"""
                <div class="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs text-slate-400 font-mono font-medium truncate block max-w-[70%]">{folder}/</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {'bg-red-500/10 text-red-400' if stats['folder_complexity'].get(folder, dict()).get('rating') == 'Alta' else 'bg-yellow-500/10 text-yellow-400' if stats['folder_complexity'].get(folder, dict()).get('rating') == 'Media' else 'bg-emerald-500/10 text-emerald-400'}">{stats['folder_complexity'].get(folder, dict()).get('rating', 'Baja')}</span>
                    </div>
                    <div class="flex justify-between items-end mt-2">
                        <div>
                            <span class="text-[10px] text-slate-500 block">Complejidad Módulo</span>
                            <span class="text-xs font-bold text-slate-300">Clases / Funcs: {stats['folder_complexity'].get(folder, dict()).get('classes', 0)} / {stats['folder_complexity'].get(folder, dict()).get('functions', 0) + stats['folder_complexity'].get(folder, dict()).get('components', 0)}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-indigo-400 block">Coste Est.</span>
                            <span class="text-sm font-black text-indigo-300">USD {format_number(cost)}</span>
                        </div>
                    </div>
                </div>
                """ for folder, tokens, cost in stats['folders'][:12]])}
            </div>
        </div>

        <!-- Section: File List -->
        <div class="mt-6 bg-glass border border-slate-800 rounded-2xl p-6">
            <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Análisis de Archivos (Clasificados por Impacto / Blast Radius)</h3>
            <div class="overflow-x-auto scrollbar-custom max-h-[350px]">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="text-slate-400 border-b border-slate-800 bg-slate-950/40">
                            <th class="py-2.5 px-3">Ruta del Archivo</th>
                            <th class="py-2.5 px-3">Lenguaje</th>
                            <th class="py-2.5 px-3 text-right">Líneas</th>
                            <th class="py-2.5 px-3 text-right">Tokens</th>
                            <th class="py-2.5 px-3 text-right">Impacto (Blast Radius)</th>
                            <th class="py-2.5 px-3 text-right">Métricas Estructurales</th>
                            <th class="py-2.5 px-3 text-right">Costo Est. Lectura</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        {"".join([f"""
                        <tr class="hover:bg-slate-800/20 text-slate-300 transition duration-150">
                            <td class="py-2 px-3 font-mono font-medium truncate max-w-sm">{path}</td>
                            <td class="py-2 px-3">{fstats['language']}</td>
                            <td class="py-2 px-3 text-right font-mono">{format_number(fstats['lines'])}</td>
                            <td class="py-2 px-3 text-right font-mono font-semibold text-slate-200">{format_number(fstats['tokens'])}</td>
                            <td class="py-2 px-3 text-right font-mono font-bold {'text-red-400' if fstats.get('impact_score', 0) > 10 else 'text-yellow-400' if fstats.get('impact_score', 0) > 3 else 'text-slate-400'}">{fstats.get('impact_score', 0)} archivos</td>
                            <td class="py-2 px-3 text-right text-[10px] text-slate-400">{' | '.join([f"{k.replace('_',' ').title()[:4]}: {v}" for k, v in fstats.get('language_metrics', dict()).items() if isinstance(v, (int, float))]) if fstats.get('language_metrics') else '-'}</td>
                            <td class="py-2 px-3 text-right font-mono text-indigo-400">USD {((fstats['tokens']/1000000.0)*costs['input_1m']):.5f}</td>
                        </tr>
                        """ for path, fstats in sorted(stats['files'].items(), key=lambda x: x[1].get('impact_score', 0), reverse=True)[:100]])}
                        {f'<tr class="text-slate-500 italic"><td colspan="7" class="py-3 px-3 text-center">Mostrando los primeros 100 archivos ordenados por mayor impacto en el grafo de dependencias. Se analizaron {summary["files"]} archivos en total.</td></tr>' if len(stats["files"]) > 100 else ""}
                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <!-- Script to set up charts -->
    <script>
        const languages = {json.dumps(lang_labels)};
        const langTokens = {json.dumps(lang_tokens)};
        
        const categories = {json.dumps(cat_labels)};
        const catTokens = {json.dumps(cat_tokens)};
        
        const folders = {json.dumps(folder_labels)};
        const folderTokens = {json.dumps(folder_tokens)};
        
        const colors = [
            '#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', 
            '#F59E0B', '#EF4444', '#64748B', '#14B8A6', '#8B5CF6'
        ];

        // Language Doughnut
        new Chart(document.getElementById('languageChart').getContext('2d'), {{
            type: 'doughnut',
            data: {{
                labels: languages.slice(0, 7),
                datasets: [{{
                    data: langTokens.slice(0, 7),
                    backgroundColor: colors.slice(0, 7),
                    borderWidth: 1,
                    borderColor: '#1E293B',
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'right',
                        labels: {{
                            boxWidth: 8,
                            color: '#94A3B8',
                            font: {{ family: 'Outfit', size: 10 }}
                        }}
                    }}
                }}
            }}
        }});

        // Category Doughnut
        new Chart(document.getElementById('categoryChart').getContext('2d'), {{
            type: 'doughnut',
            data: {{
                labels: categories,
                datasets: [{{
                    data: catTokens,
                    backgroundColor: colors.slice(2, 2 + categories.length),
                    borderWidth: 1,
                    borderColor: '#1E293B',
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'right',
                        labels: {{
                            boxWidth: 8,
                            color: '#94A3B8',
                            font: {{ family: 'Outfit', size: 10 }}
                        }}
                    }}
                }}
            }}
        }});

        // Top Folders Horizontal Bar Chart
        new Chart(document.getElementById('foldersChart').getContext('2d'), {{
            type: 'bar',
            data: {{
                labels: folders.map(f => f.length > 25 ? '...' + f.slice(-22) : f),
                datasets: [{{
                    label: 'Tokens',
                    data: folderTokens,
                    backgroundColor: 'rgba(99, 102, 241, 0.75)',
                    hoverBackgroundColor: '#6366F1',
                    borderRadius: 6,
                    borderWidth: 0,
                }}]
            }},
            options: {{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {{
                    x: {{
                        grid: {{ color: 'rgba(51, 65, 85, 0.3)' }},
                        ticks: {{ color: '#94A3B8', font: {{ family: 'Outfit', size: 10 }} }}
                    }},
                    y: {{
                        grid: {{ display: false }},
                        ticks: {{ color: '#E2E8F0', font: {{ family: 'Outfit', size: 10 }} }}
                    }}
                }},
                plugins: {{
                    legend: {{ display: false }}
                }}
            }}
        }});

        // Snapshot timeline chart
        {f"""
        const snapDates = {json.dumps(snapshot_dates)};
        const snapTokens = {json.dumps(snapshot_tokens)};
        const snapCost = {json.dumps(snapshot_cost)};
        
        new Chart(document.getElementById('snapshotChart').getContext('2d'), {{
            type: 'line',
            data: {{
                labels: snapDates,
                datasets: [
                    {{
                        label: 'Tokens',
                        data: snapTokens,
                        borderColor: '#6366F1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.3,
                        yAxisID: 'y'
                    }},
                    {{
                        label: 'Coste (USD)',
                        data: snapCost,
                        borderColor: '#EC4899',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                scales: {{
                    x: {{
                        grid: {{ color: 'rgba(51, 65, 85, 0.2)' }},
                        ticks: {{ color: '#94A3B8', font: {{ family: 'Outfit', size: 10 }} }}
                    }},
                    y: {{
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {{ color: 'rgba(51, 65, 85, 0.3)' }},
                        ticks: {{ color: '#6366F1', font: {{ family: 'Outfit', size: 10 }} }}
                    }},
                    y1: {{
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#EC4899', font: {{ family: 'Outfit', size: 10 }} }}
                    }}
                }},
                plugins: {{
                    legend: {{
                        labels: {{ color: '#94A3B8', font: {{ family: 'Outfit', size: 10 }} }}
                    }}
                }}
            }}
        }});
        """ if len(snapshots) > 1 else ""}
    </script>
</body>
</html>
"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
