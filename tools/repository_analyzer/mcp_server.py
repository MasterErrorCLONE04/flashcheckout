import sys
import json
import os

# Setup paths
script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.abspath(os.path.join(script_dir, '..', '..'))
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, 'tools'))

from repository_analyzer.query_engine import query_semantic_context

def get_tools_list():
    return {
        "tools": [
            {
                "name": "search_context",
                "description": "Busca y planifica el contexto de archivos óptimo recomendado para una tarea de desarrollo en lenguaje natural, filtrando el ruido del repositorio.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Descripción de la tarea a realizar (ej: 'Implementar autenticación OAuth2')"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "analyze_impact",
                "description": "Evalúa el blast radius, nivel de riesgo y archivos afectados por modificar un archivo específico del repositorio.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file": {"type": "string", "description": "Ruta relativa del archivo a modificar (ej: 'lib/prisma.ts')"}
                    },
                    "required": ["file"]
                }
            },
            {
                "name": "get_architecture",
                "description": "Devuelve el reporte completo de la arquitectura inferida, patrones de diseño, flujo lógico de capas y dashboard SonarQube de riesgos.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "find_symbol",
                "description": "Busca la definición de un símbolo (clase, función, método) en la Tabla de Símbolos global y devuelve su ubicación y llamadas.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Nombre del símbolo a buscar (ej: 'sendInvoiceToWhatsApp')"}
                    },
                    "required": ["name"]
                }
            },
            {
                "name": "get_execution_flow",
                "description": "Traza el flujo de ejecución y llamadas (Call Graph) a partir de un símbolo inicial en el Grafo de Conocimiento.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "symbol": {"type": "string", "description": "Nombre del símbolo inicial (ej: 'handleWhatsAppMessage')"}
                    },
                    "required": ["symbol"]
                }
            },
            {
                "name": "get_history",
                "description": "Devuelve la memoria evolutiva y transacciones históricas registradas que coinciden con una consulta (ej: 'Mercado Pago').",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Concepto o módulo a buscar en el historial"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "find_decision",
                "description": "Busca Architecture Decision Records (ADRs) guardados relacionados con un tema o módulo específico.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string", "description": "Término clave a buscar en las decisiones (ej: 'Adapter')"}
                    },
                    "required": ["topic"]
                }
            },
            {
                "name": "predict_impact",
                "description": "Analiza las transacciones históricas para predecir riesgos y advertir sobre dependencias inestables al modificar un archivo.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file": {"type": "string", "description": "Ruta del archivo a predecir (ej: 'lib/prisma.ts')"}
                    },
                    "required": ["file"]
                }
            },
            {
                "name": "create_plan",
                "description": "Genera un plan de cambios semánticos detallado (creaciones/modificaciones de archivos) basado en una tarea en lenguaje natural y patrones de diseño históricos del repositorio.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "task": {"type": "string", "description": "Descripción de la tarea (ej: 'Agregar Apple Pay')"}
                    },
                    "required": ["task"]
                }
            },
            {
                "name": "verify_change",
                "description": "Valida las consecuencias de un cambio propuesto evaluando el linter, compilación, tests y el score de AI Readiness.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "before_score": {"type": "integer", "description": "Puntuación de AI Readiness previa al cambio"},
                        "after_score": {"type": "integer", "description": "Puntuación de AI Readiness posterior al cambio"},
                        "before_complexity": {"type": "integer", "description": "Complejidad ciclomática global previa"},
                        "after_complexity": {"type": "integer", "description": "Complejidad ciclomática global posterior"},
                        "tests_passed": {"type": "boolean", "description": "Indica si las pruebas unitarias pasaron exitosamente"}
                    },
                    "required": ["before_score", "after_score", "before_complexity", "after_complexity", "tests_passed"]
                }
            },
            {
                "name": "start_transaction",
                "description": "Crea una rama de Git temporal para cambios aislados de la transacción.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "tx_id": {"type": "string", "description": "ID de transacción semántica (ej: 'tx_00034')"},
                        "branch_name": {"type": "string", "description": "Nombre de la rama temporal de Git"}
                    },
                    "required": ["tx_id", "branch_name"]
                }
            },
            {
                "name": "commit_transaction",
                "description": "Confirma y añade los cambios de la transacción a Git.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "commit_message": {"type": "string", "description": "Mensaje de confirmación del commit"}
                    },
                    "required": ["commit_message"]
                }
            },
            {
                "name": "rollback_transaction",
                "description": "Descarta todos los cambios de la rama temporal, vuelve a la rama original y elimina la rama temporal.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "branch_name": {"type": "string", "description": "Nombre de la rama temporal a eliminar"},
                        "original_branch": {"type": "string", "description": "Nombre de la rama original a restaurar (ej: 'main')"}
                    },
                    "required": ["branch_name"]
                }
            },
            {
                "name": "propose_patch",
                "description": "Genera y propone el parche estructural AST para aplicar en el archivo destino.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "task": {"type": "string", "description": "Descripción de la tarea"},
                        "plan": {"type": "object", "description": "Plan JSON retornado por create_plan"}
                    },
                    "required": ["task", "plan"]
                }
            },
            {
                "name": "apply_patch",
                "description": "Aplica físicamente la modificación estructural AST en el Sandbox.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "patch_spec": {"type": "object", "description": "Especificación del parche retornado por propose_patch"}
                    },
                    "required": ["patch_spec"]
                }
            },
            {
                "name": "diagnose_error",
                "description": "Analiza y diagnostica un error de compilación o linter contrastándolo con la Tabla de Símbolos.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "error_log": {"type": "string", "description": "Traza del log de error del compilador o linter"},
                        "file": {"type": "string", "description": "Ruta relativa del archivo que originó el error"}
                    },
                    "required": ["error_log", "file"]
                }
            },
            {
                "name": "repair_change",
                "description": "Activa la estrategia de auto-reparación y reintenta aplicar un parche correctivo AST en el Sandbox.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "tx_id": {"type": "string", "description": "ID de transacción semántica"},
                        "branch_name": {"type": "string", "description": "Nombre de la rama temporal de Git"},
                        "error_log": {"type": "string", "description": "Traza del log de error"},
                        "file": {"type": "string", "description": "Ruta relativa del archivo a corregir"}
                    },
                    "required": ["tx_id", "branch_name", "error_log", "file"]
                }
            },
            {
                "name": "get_failure_history",
                "description": "Devuelve el historial de fallos conocidos y resoluciones exitosas guardadas en failures.json.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Texto o concepto a buscar en la memoria de fallos"}
                    },
                    "required": ["query"]
                }
            }
        ]
    }

def handle_search_context(arguments):
    query = arguments.get("query", "")
    res = query_semantic_context(query, base_dir)
    return res

def handle_analyze_impact(arguments):
    rel_path = arguments.get("file", "").replace('\\', '/').lstrip('/')
    deps_path = os.path.join(base_dir, '.repository-ai', 'dependencies.json')
    context_map_path = os.path.join(base_dir, '.repository-ai', 'context-map.json')
    
    empty_res = {"file": rel_path, "risk": "LOW", "coupling": 0, "affected_files": 0, "details": "File not found or not indexed."}
    
    if not os.path.exists(deps_path) or not os.path.exists(context_map_path):
        return empty_res
        
    try:
        with open(deps_path, 'r', encoding='utf-8') as f:
            deps_data = json.load(f)
        with open(context_map_path, 'r', encoding='utf-8') as f:
            ctx_map = json.load(f)
    except Exception:
        return empty_res
        
    dependents = deps_data.get('dependents_map', {}).get(rel_path, [])
    file_tokens = ctx_map.get(rel_path, {}).get('tokens', 0)
    
    total_files = len(ctx_map)
    coupling = int((len(dependents) / total_files) * 100) if total_files else 0
    
    risk = "LOW"
    if len(dependents) >= 15 or file_tokens > 20000:
        risk = "HIGH"
    elif len(dependents) >= 6 or file_tokens > 10000:
        risk = "MEDIUM"
        
    return {
        "file": rel_path,
        "risk": risk,
        "coupling_percentage": coupling,
        "direct_dependents_count": len(dependents),
        "direct_dependents": dependents[:10],
        "estimated_tokens": file_tokens
    }

def handle_get_architecture(arguments):
    arch_path = os.path.join(base_dir, '.repository-ai', 'architecture.json')
    if os.path.exists(arch_path):
        try:
            with open(arch_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"error": "Architecture metadata file not found. Run --save-memory first."}

def handle_find_symbol(arguments):
    name = arguments.get("name", "").lower()
    knowledge_path = os.path.join(base_dir, '.repository-ai', 'knowledge.json')
    
    if not os.path.exists(knowledge_path):
        return {"error": "Knowledge Graph metadata file not found. Run --save-memory first."}
        
    try:
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            graph = json.load(f)
    except Exception:
        return {"error": "Failed to parse Knowledge Graph."}
        
    matches = []
    for node in graph.get('nodes', []):
        node_id = node.get('id', '')
        if name in node_id.lower():
            matches.append(node)
            
    return {
        "query": name,
        "matches": matches[:10]
    }

def handle_get_execution_flow(arguments):
    symbol = arguments.get("symbol", "").lower()
    knowledge_path = os.path.join(base_dir, '.repository-ai', 'knowledge.json')
    
    if not os.path.exists(knowledge_path):
        return {"error": "Knowledge Graph metadata file not found. Run --save-memory first."}
        
    try:
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            graph = json.load(f)
    except Exception:
        return {"error": "Failed to parse Knowledge Graph."}
        
    flow_edges = []
    for edge in graph.get('edges', []):
        src = edge.get('source', '')
        tgt = edge.get('target', '')
        rel = edge.get('type', '')
        
        if rel == 'CALLS' and (symbol in src.lower() or symbol in tgt.lower()):
            flow_edges.append(edge)
            
    return {
        "symbol": symbol,
        "flow_relationships": flow_edges[:20]
    }

def handle_get_history(arguments):
    query = arguments.get("query", "").lower()
    history_path = os.path.join(base_dir, '.repository-ai', 'history.json')
    if not os.path.exists(history_path):
        return {"error": "No history recorded yet."}
    try:
        with open(history_path, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except Exception:
        return {"error": "Failed to parse history."}
      
    matches = []
    for tx in history:
        tx_str = json.dumps(tx).lower()
        if query in tx_str:
            matches.append(tx)
    return {"query": query, "matches": matches[:10]}

def handle_find_decision(arguments):
    topic = arguments.get("topic", "").lower()
    decisions_path = os.path.join(base_dir, '.repository-ai', 'decisions.json')
    if not os.path.exists(decisions_path):
        return {"error": "No decisions recorded yet."}
    try:
        with open(decisions_path, 'r', encoding='utf-8') as f:
            decisions = json.load(f)
    except Exception:
        return {"error": "Failed to parse decisions."}
          
    matches = []
    for adr in decisions:
        adr_str = json.dumps(adr).lower()
        if topic in adr_str:
            matches.append(adr)
    return {"topic": topic, "matches": matches[:10]}

def handle_predict_impact(arguments):
    rel_path = arguments.get("file", "").replace('\\', '/').lstrip('/')
    history_path = os.path.join(base_dir, '.repository-ai', 'history.json')
    
    if not os.path.exists(history_path):
        return {"file": rel_path, "risk": "UNKNOWN", "historical_changes_count": 0, "warnings": ["No historical transactions recorded yet."]}
          
    try:
        with open(history_path, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except Exception:
        return {"error": "Failed to parse history."}
          
    changes_count = 0
    associated_intents = []
    for tx in history:
        modified_files = tx.get("files", {}).get("modified", []) + tx.get("files", {}).get("created", [])
        if any(rel_path in f for f in modified_files):
            changes_count += 1
            associated_intents.append(tx.get("intent", ""))
              
    risk = "LOW"
    warnings = []
    if changes_count >= 5:
        risk = "CRITICAL"
        warnings.append(f"Este archivo ha sido modificado {changes_count} veces. Foco severo de inestabilidad histórica (churn).")
    elif changes_count >= 2:
        risk = "MEDIUM"
        warnings.append("Modificaciones frecuentes detectadas en el historial.")
          
    return {
        "file": rel_path,
        "risk": risk,
        "historical_changes_count": changes_count,
        "associated_intents": list(set(associated_intents)),
        "warnings": warnings
    }

def handle_create_plan(arguments):
    from repository_analyzer.agent_loop import create_change_plan
    task = arguments.get("task", "")
    return create_change_plan(task, base_dir)

def handle_verify_change(arguments):
    from repository_analyzer.agent_loop import verify_change_consequences
    return verify_change_consequences(
        base_dir,
        arguments.get("before_score", 80),
        arguments.get("after_score", 80),
        arguments.get("before_complexity", 10),
        arguments.get("after_complexity", 10),
        arguments.get("tests_passed", True)
    )

def handle_start_transaction(arguments):
    from repository_analyzer.transaction_manager import start_transaction
    return start_transaction(base_dir, arguments.get("tx_id", "tx_00001"), arguments.get("branch_name", "agent/proposed-change"))

def handle_commit_transaction(arguments):
    from repository_analyzer.transaction_manager import commit_transaction
    return commit_transaction(base_dir, arguments.get("commit_message", "feat: agent proposed modifications"))

def handle_rollback_transaction(arguments):
    from repository_analyzer.transaction_manager import rollback_transaction
    return rollback_transaction(base_dir, arguments.get("branch_name", "agent/proposed-change"), arguments.get("original_branch", "main"))

def handle_propose_patch(arguments):
    from repository_analyzer.patch_engine import propose_patch_spec
    return propose_patch_spec(arguments.get("task"), arguments.get("plan"), base_dir)

def handle_apply_patch(arguments):
    from repository_analyzer.patch_engine import apply_patch_spec
    return apply_patch_spec(arguments.get("patch_spec"), base_dir)

def handle_diagnose_error(arguments):
    from repository_analyzer.error_analyzer import parse_error_log, diagnose_ast_mismatch
    diag = parse_error_log(arguments.get("error_log", ""), arguments.get("file", ""))
    ast_diag = diagnose_ast_mismatch(diag, base_dir)
    return {
        "diagnosis": diag,
        "ast_cross_reference": ast_diag
    }

def handle_repair_change(arguments):
    from repository_analyzer.repair_engine import execute_self_healing_retry
    return execute_self_healing_retry(
        base_dir,
        arguments.get("tx_id", "tx_00001"),
        arguments.get("branch_name", "agent/proposed-change"),
        arguments.get("error_log", ""),
        arguments.get("file", "")
    )

def handle_get_failure_history(arguments):
    query = arguments.get("query", "").lower()
    failures_path = os.path.join(base_dir, '.repository-ai', 'failures.json')
    if not os.path.exists(failures_path):
        return {"error": "No failures recorded yet."}
    try:
        with open(failures_path, 'r', encoding='utf-8') as f:
            failures = json.load(f)
    except Exception:
        return {"error": "Failed to parse failures history."}
    
    matches = {}
    for err_pattern, stats in failures.items():
        if query in err_pattern.lower() or query in json.dumps(stats).lower():
            matches[err_pattern] = stats
            
    return {"query": query, "matches": matches}

def main():
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
            
        msg_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})
        
        if method == "initialize":
            res = {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {
                        "name": "Repository Intelligence Server",
                        "version": "1.0.0"
                    }
                }
            }
        elif method == "tools/list" or method == "listTools":
            res = {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": get_tools_list()
            }
        elif method == "tools/call" or method == "callTool":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            
            tool_res = None
            if tool_name == "search_context":
                tool_res = handle_search_context(arguments)
            elif tool_name == "analyze_impact":
                tool_res = handle_analyze_impact(arguments)
            elif tool_name == "get_architecture":
                tool_res = handle_get_architecture(arguments)
            elif tool_name == "find_symbol":
                tool_res = handle_find_symbol(arguments)
            elif tool_name == "get_execution_flow":
                tool_res = handle_get_execution_flow(arguments)
            elif tool_name == "get_history":
                tool_res = handle_get_history(arguments)
            elif tool_name == "find_decision":
                tool_res = handle_find_decision(arguments)
            elif tool_name == "predict_impact":
                tool_res = handle_predict_impact(arguments)
            elif tool_name == "create_plan":
                tool_res = handle_create_plan(arguments)
            elif tool_name == "verify_change":
                tool_res = handle_verify_change(arguments)
            elif tool_name == "start_transaction":
                tool_res = handle_start_transaction(arguments)
            elif tool_name == "commit_transaction":
                tool_res = handle_commit_transaction(arguments)
            elif tool_name == "rollback_transaction":
                tool_res = handle_rollback_transaction(arguments)
            elif tool_name == "propose_patch":
                tool_res = handle_propose_patch(arguments)
            elif tool_name == "apply_patch":
                tool_res = handle_apply_patch(arguments)
            elif tool_name == "diagnose_error":
                tool_res = handle_diagnose_error(arguments)
            elif tool_name == "repair_change":
                tool_res = handle_repair_change(arguments)
            elif tool_name == "get_failure_history":
                tool_res = handle_get_failure_history(arguments)
            else:
                tool_res = {"error": f"Tool '{tool_name}' not found."}
                
            res = {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(tool_res, indent=2, ensure_ascii=False)
                        }
                    ]
                }
            }
        else:
            res = {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {
                    "code": -32601,
                    "message": f"Method '{method}' not found."
                }
            }
            
        sys.stdout.write(json.dumps(res, ensure_ascii=False) + "\n")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
