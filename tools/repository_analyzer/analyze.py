import os
import argparse
import sys
import time
from repository_analyzer.config import DEFAULT_MODEL, PRICING_MODELS
from repository_analyzer.cache import init_cache, save_snapshot
from repository_analyzer.scanner import scan_files
from repository_analyzer.detector import detect_project_type
from repository_analyzer.statistics import calculate_statistics, analyze_git_work
from repository_analyzer.reporter import (
    print_console,
    save_json,
    save_csv,
    save_html,
    save_markdown
)

def main():
    # Resolve default project root: grandparent of the current file's directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    default_project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    
    parser = argparse.ArgumentParser(
        description="FlashCheckouts Repository Analyzer - Análisis de tokens, líneas, caracteres y costos."
    )
    parser.add_argument(
        '-p', '--path',
        default=default_project_root,
        help=f"Ruta del directorio a analizar (por defecto: {default_project_root})"
    )
    parser.add_argument(
        '-o', '--output-dir',
        default=os.path.join(default_project_root, 'reports'),
        help="Directorio donde se guardarán los informes JSON, CSV, HTML y Markdown (por defecto: ./reports)"
    )
    parser.add_argument(
        '-m', '--model',
        default=DEFAULT_MODEL,
        choices=list(PRICING_MODELS.keys()),
        help=f"Modelo de IA para estimar costes (por defecto: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        '-e', '--exclude',
        action='append',
        help="Directorios adicionales para excluir del análisis (ej: -e workers -e temp)"
    )
    parser.add_argument(
        '--no-git',
        action='store_true',
        help="Desactiva la comprobación automática de cambios en Git"
    )
    parser.add_argument(
        '--incremental',
        action='store_true',
        help="Muestra solamente un resumen de cambios e incrementos desde la última ejecución (usa la caché)"
    )
    
    args = parser.parse_args()
    
    base_dir = os.path.abspath(args.path)
    output_dir = os.path.abspath(args.output_dir)
    
    if not os.path.exists(base_dir):
        print(f"Error: La ruta '{base_dir}' no existe.", file=sys.stderr)
        sys.exit(1)
        
    # Start total timer
    start_total = time.perf_counter()
    
    # 0. Detect project framework/configuration
    project_tags = detect_project_type(base_dir)
    
    print(f"Iniciando análisis del repositorio en: {base_dir}")
    print(f"Tipo de proyecto detectado: {', '.join(project_tags)}")
    print(f"Exclusiones configuradas: se omitirán carpetas ignoradas y archivos binarios.")
    if args.exclude:
        print(f"Exclusiones extra: {', '.join(args.exclude)}")
        
    # 1. Initialize SQLite Cache Database
    init_cache(base_dir)
    
    # 2. Scan files (time this step)
    start_scan = time.perf_counter()
    files = scan_files(base_dir, custom_ignores=args.exclude)
    dur_scan = time.perf_counter() - start_scan
    
    if not args.incremental:
        print(f"Escaneados {len(files)} archivos de texto relevantes...")
    
    # 3. Tokenize and calculate statistics using caching + thread pool (time this step)
    start_tokenize = time.perf_counter()
    if not args.incremental:
        print("Tokenizando y recopilando estadísticas...")
    stats = calculate_statistics(files, base_dir, model_name=args.model, incremental=args.incremental)
    
    # Collect Git status details
    git_stats = None
    if not args.no_git:
        git_stats = analyze_git_work(base_dir)
        
    dur_tokenize = time.perf_counter() - start_tokenize
    
    # 4. Generate Reports (time this step)
    start_report = time.perf_counter()
    
    dur_total = time.perf_counter() - start_total
    
    durations = {
        'scan': dur_scan,
        'tokenize': dur_tokenize,
        'report': 0.0,
        'total': dur_total
    }
    
    # Resolve report file paths
    json_path = os.path.join(output_dir, 'report.json')
    csv_path = os.path.join(output_dir, 'report.csv')
    html_path = os.path.join(output_dir, 'report.html')
    md_path = os.path.join(output_dir, 'report.md')
    
    if not args.incremental:
        print(f"\nGenerando informes en: {output_dir}")
        
    try:
        # Save reports
        save_json(stats, git_stats, json_path, durations, project_tags)
        save_csv(stats, csv_path, args.model)
        
        # Save Markdown report
        save_markdown(stats, git_stats, md_path, args.model, durations, project_tags)
        
        # Calculate reporting time before rendering HTML
        dur_report = time.perf_counter() - start_report
        durations['report'] = dur_report
        durations['total'] = time.perf_counter() - start_total
        
        save_html(stats, git_stats, html_path, args.model, durations, project_tags)
        
        # Save snapshot metric to historical cache database
        from repository_analyzer.pricing import calculate_costs
        costs = calculate_costs(stats['summary']['tokens'], args.model)
        save_snapshot(
            stats['summary']['files'],
            stats['summary']['lines'],
            stats['summary']['tokens'],
            costs['read_1']
        )
        
        if not args.incremental:
            print(f" ✔ JSON guardado en:      {json_path}")
            print(f" ✔ CSV guardado en:       {csv_path}")
            print(f" ✔ HTML guardado en:      {html_path}")
            print(f" ✔ Markdown guardado en:  {md_path}")
            
    except Exception as e:
        print(f"Error al escribir los informes: {e}", file=sys.stderr)
        sys.exit(1)
        
    # 5. Output console printout
    if args.incremental:
        print("\n" + "═" * 48)
        print("  Resumen Incremental (Fase 2.5)")
        print("═" * 48)
        print(f"Archivos analizados.... {len(files)}")
        print(f"Hits de caché (SQLite).. {stats['summary']['cache_hits']}")
        print(f"Archivos modificados... {len(stats['incremental_changes'])}")
        if stats['incremental_changes']:
            print("Detalles de cambios:")
            for f in stats['incremental_changes'][:10]:
                print(f"  ➜ {f}")
            if len(stats['incremental_changes']) > 10:
                print(f"  ... y {len(stats['incremental_changes']) - 10} más.")
        print(f"Duración total......... {durations['total']:.3f} s")
        print("═" * 48)
    else:
        print_console(stats, git_stats, args.model, durations, project_tags)
        print("\n¡Análisis completado con éxito!")

if __name__ == '__main__':
    main()
