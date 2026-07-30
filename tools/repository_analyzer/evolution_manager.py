import os
import json
import time
from repository_analyzer.diff_engine import get_ast_semantic_diff

def record_evolution_transaction(base_dir, new_graph, stats):
    """
    Compares the current new graph with the stored old graph, registers a transaction
    in history.json, generates ADRs in decisions.json, and records timeline stats in evolution.json.
    """
    memory_dir = os.path.join(base_dir, '.repository-ai')
    os.makedirs(memory_dir, exist_ok=True)
    
    history_path = os.path.join(memory_dir, 'history.json')
    decisions_path = os.path.join(memory_dir, 'decisions.json')
    evolution_path = os.path.join(memory_dir, 'evolution.json')
    knowledge_path = os.path.join(memory_dir, 'knowledge.json')
    
    # 1. Load previous knowledge graph for diffing
    old_graph = None
    if os.path.exists(knowledge_path):
        try:
            with open(knowledge_path, 'r', encoding='utf-8') as f:
                old_graph = json.load(f)
        except Exception:
            pass
            
    # 2. Compute semantic AST diff
    diff = get_ast_semantic_diff(old_graph, new_graph)
    
    # Check if there are actual changes before creating a transaction
    has_changes = (
        len(diff['files']['created']) > 0 or 
        len(diff['files']['modified']) > 0 or 
        len(diff['files']['deleted']) > 0 or
        len(diff['symbols']['created']) > 0 or
        len(diff['symbols']['modified']) > 0 or
        len(diff['symbols']['deleted']) > 0
    )
    
    if not has_changes:
        return
        
    # 3. Load existing history
    history_list = []
    if os.path.exists(history_path):
        try:
            with open(history_path, 'r', encoding='utf-8') as f:
                history_list = json.load(f)
        except Exception:
            pass
            
    tx_id = f"tx_{len(history_list) + 1:05d}"
    
    # Infer Intent based on files modified
    changed_files_str = " ".join(diff['files']['created'] + diff['files']['modified']).lower()
    intent = "Mantenimiento General de Código"
    affected_modules = set()
    
    if 'stripe' in changed_files_str or 'mercadopago' in changed_files_str or 'payment' in changed_files_str or 'pago' in changed_files_str:
        intent = "Integración de Pasarelas de Pago"
        affected_modules.add("Payments")
    elif 'whatsapp' in changed_files_str or 'bot' in changed_files_str or 'chatbot' in changed_files_str:
        intent = "Desarrollo del Chatbot / Canal WhatsApp"
        affected_modules.add("Chatbot")
    elif 'auth' in changed_files_str or 'user' in changed_files_str or 'session' in changed_files_str:
        intent = "Configuración de Autenticación & Seguridad"
        affected_modules.add("Auth")
        
    # Walk directory to infer other modules
    for f in (diff['files']['created'] + diff['files']['modified']):
        parts = f.split('/')
        if len(parts) > 1:
            affected_modules.add(parts[0].capitalize())
            
    # Compile transaction metadata
    transaction = {
        "id": tx_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "intent": intent,
        "agent": {
            "type": "developer-agent",
            "model": "Gemini-1.5-Pro"
        },
        "files": diff['files'],
        "symbols": [
            {
                "name": sym['id'].split('#')[-1],
                "action": "NEW",
                "file": sym['file']
            } for sym in diff['symbols']['created']
        ] + [
            {
                "name": sym['id'].split('#')[-1],
                "action": "MODIFIED",
                "file": sym['file']
            } for sym in diff['symbols']['modified']
        ] + [
            {
                "name": sym['id'].split('#')[-1],
                "action": "DELETED",
                "file": sym['file']
            } for sym in diff['symbols']['deleted']
        ],
        "patterns_detected": [p['pattern'] for p in diff['patterns_detected']],
        "impact": {
            "modules": list(affected_modules),
            "files_count": len(diff['files']['created']) + len(diff['files']['modified']) + len(diff['files']['deleted'])
        }
    }
    
    history_list.append(transaction)
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(history_list, f, indent=2, ensure_ascii=False)
        
    # 4. Generate Automatic ADRs (decisions.json)
    decisions_list = []
    if os.path.exists(decisions_path):
        try:
            with open(decisions_path, 'r', encoding='utf-8') as f:
                decisions_list = json.load(f)
        except Exception:
            pass
            
    for pat in diff['patterns_detected']:
        adr_id = f"ADR-{len(decisions_list) + 1:03d}"
        adr = {
            "decision": adr_id,
            "title": f"Usar {pat['pattern']} en el símbolo {pat['symbol']}",
            "context": f"El repositorio requería implementar/abstraer la lógica del símbolo: {pat['symbol']}.",
            "decision_made": f"Introducir la estructura de {pat['pattern']}.",
            "consequences": [
                "Mayor extensibilidad del código",
                "Desacoplamiento de componentes",
                "Definición estructurada del flujo de ejecución"
            ],
            "affected_modules": list(affected_modules)
        }
        decisions_list.append(adr)
        
    with open(decisions_path, 'w', encoding='utf-8') as f:
        json.dump(decisions_list, f, indent=2, ensure_ascii=False)
        
    # 4.5 Update patterns.json (Pattern Learning Engine)
    patterns_path = os.path.join(memory_dir, 'patterns.json')
    patterns_map = {}
    if os.path.exists(patterns_path):
        try:
            with open(patterns_path, 'r', encoding='utf-8') as f:
                patterns_map = json.load(f)
        except Exception:
            pass
            
    for pat in diff['patterns_detected']:
        p_name = pat['pattern']
        if p_name not in patterns_map:
            patterns_map[p_name] = {
                "usage": 0,
                "success_rate": 100,
                "avg_complexity_change": 0
            }
        patterns_map[p_name]["usage"] += 1
        patterns_map[p_name]["success_rate"] = int((patterns_map[p_name]["success_rate"] * (patterns_map[p_name]["usage"] - 1) + 100) / patterns_map[p_name]["usage"])
        
    with open(patterns_path, 'w', encoding='utf-8') as f:
        json.dump(patterns_map, f, indent=2, ensure_ascii=False)
        
    # 5. Update evolution timeline (evolution.json)
    evolution_list = []
    if os.path.exists(evolution_path):
        try:
            with open(evolution_path, 'r', encoding='utf-8') as f:
                evolution_list = json.load(f)
        except Exception:
            pass
            
    ai_readiness_score = stats.get('readiness', {}).get('score', 75)
    evolution_snapshot = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "ai_readiness_score": ai_readiness_score,
        "total_files": stats.get('total_files', 0),
        "total_tokens": stats.get('total_tokens', 0)
    }
    
    # Avoid duplicate snapshots in the same run if stats are identical
    if not evolution_list or evolution_list[-1]["ai_readiness_score"] != ai_readiness_score or evolution_list[-1]["total_files"] != stats.get('total_files', 0):
        evolution_list.append(evolution_snapshot)
        with open(evolution_path, 'w', encoding='utf-8') as f:
            json.dump(evolution_list, f, indent=2, ensure_ascii=False)
