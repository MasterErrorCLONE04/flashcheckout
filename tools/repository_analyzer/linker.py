import os
import json
from repository_analyzer.ast_manager import parse_file_ast

def compile_knowledge_graph(workspace_files, base_dir):
    """
    Scans all workspace files, compiles their ASTs, resolves symbol references,
    and returns a unified nodes/edges Knowledge Graph.
    """
    nodes = []
    edges = []
    
    # Maps to build symbol directory
    # file_path -> { symbol_name -> symbol_ast }
    exports_by_file = {}
    imports_by_file = {}
    classes_by_file = {}
    functions_by_file = {}
    
    # 1. Parse AST for all files and build local indexes
    file_asts = {}
    for f in workspace_files:
        if not f.endswith(('.ts', '.tsx', '.js', '.jsx', '.py')):
            continue
        ast_data = parse_file_ast(f, base_dir)
        file_asts[f] = ast_data
        
        # Add file node
        nodes.append({
            "id": f,
            "type": "file"
        })
        
        # Index exports
        exports_by_file[f] = {}
        for exp in ast_data.get('exports', []):
            exports_by_file[f][exp['name']] = exp
            
        # Index imports
        imports_by_file[f] = {}
        for imp in ast_data.get('imports', []):
            for sym in imp.get('symbols', []):
                imports_by_file[f][sym['name']] = {
                    "source_file": imp.get('resolved_file'),
                    "is_external": imp.get('is_external'),
                    "original_name": sym.get('name')
                }
                
        # Index classes and methods
        classes_by_file[f] = {}
        for cls in ast_data.get('classes', []):
            classes_by_file[f][cls['name']] = cls
            
            # Register class symbol node
            class_id = f"{f}#{cls['name']}"
            nodes.append({
                "id": class_id,
                "type": "symbol",
                "kind": "class",
                "file": f,
                "docstring": cls.get('docstring', '')
            })
            edges.append({
                "source": f,
                "target": class_id,
                "type": "DECLARES"
            })
            
            for m in cls.get('methods', []):
                method_id = f"{f}#{cls['name']}.{m['name']}"
                nodes.append({
                    "id": method_id,
                    "type": "symbol",
                    "kind": "method",
                    "file": f,
                    "docstring": m.get('docstring', '')
                })
                edges.append({
                    "source": class_id,
                    "target": method_id,
                    "type": "DECLARES"
                })
                
        # Index standalone functions
        functions_by_file[f] = {}
        for fn in ast_data.get('functions', []):
            functions_by_file[f][fn['name']] = fn
            
            # Register function symbol node
            func_id = f"{f}#{fn['name']}"
            nodes.append({
                "id": func_id,
                "type": "symbol",
                "kind": "function",
                "file": f,
                "docstring": fn.get('docstring', '')
            })
            edges.append({
                "source": f,
                "target": func_id,
                "type": "DECLARES"
            })

    # Add exports and imports edges
    for f, ast_data in file_asts.items():
        # Export edges
        for exp_name, exp in exports_by_file.get(f, {}).items():
            symbol_id = f"{f}#{exp_name}"
            # Check if declared class or function node exists
            has_symbol_node = any(n['id'] == symbol_id for n in nodes)
            if not has_symbol_node:
                # Add default/variable export symbol node
                nodes.append({
                    "id": symbol_id,
                    "type": "symbol",
                    "kind": exp.get('kind', 'variable'),
                    "file": f
                })
            edges.append({
                "source": f,
                "target": symbol_id,
                "type": "EXPORTS"
            })
            
        # Import edges
        for imp in ast_data.get('imports', []):
            if not imp.get('is_external') and imp.get('resolved_file'):
                edges.append({
                    "source": f,
                    "target": imp.get('resolved_file'),
                    "type": "IMPORTS"
                })

    # 2. Resolve Call Graph References (Cross-File Calls Linker)
    for f, ast_data in file_asts.items():
        
        # Helper to resolve a call expression to a target symbol ID
        def resolve_call(call_name, current_class_name=None):
            parts = call_name.split('.')
            base = parts[0]
            
            # Local class method call (e.g. self.send() or this.send())
            if base in ['self', 'this'] and len(parts) > 1 and current_class_name:
                method_name = parts[1]
                # Check if it exists in current class
                cls_data = classes_by_file.get(f, {}).get(current_class_name)
                if cls_data:
                    for m in cls_data.get('methods', []):
                        if m['name'] == method_name:
                            return f"{f}#{current_class_name}.{method_name}"
                            
            # Check if base matches an imported local symbol name
            imp_info = imports_by_file.get(f, {}).get(base)
            if imp_info and imp_info['source_file']:
                target_file = imp_info['source_file']
                
                # Case A: Dot access call, e.g. waClient.sendText(...)
                if len(parts) > 1:
                    method_name = parts[1]
                    # Probe classes in target file to see if any class has this method
                    target_classes = classes_by_file.get(target_file, {})
                    for cls_name, cls_data in target_classes.items():
                        for m in cls_data.get('methods', []):
                            if m['name'] == method_name:
                                return f"{target_file}#{cls_name}.{method_name}"
                    
                    # Also probe top-level functions in target file
                    target_funcs = functions_by_file.get(target_file, {})
                    if method_name in target_funcs:
                        return f"{target_file}#{method_name}"
                        
                # Case B: Direct function call, e.g. send(...)
                else:
                    # Look up original symbol name in target exports
                    original_name = imp_info['original_name']
                    # Check if matches target class
                    if original_name in classes_by_file.get(target_file, {}):
                        return f"{target_file}#{original_name}"
                    # Check if matches target function
                    if original_name in functions_by_file.get(target_file, {}):
                        return f"{target_file}#{original_name}"
                        
            # Local file scoping (local functions or local classes)
            if base in functions_by_file.get(f, {}):
                return f"{f}#{base}"
            if base in classes_by_file.get(f, {}):
                return f"{f}#{base}"
                
            return None

        # Trace calls inside class methods
        for cls in ast_data.get('classes', []):
            for m in cls.get('methods', []):
                caller_id = f"{f}#{cls['name']}.{m['name']}"
                for call in m.get('calls', []):
                    callee_id = resolve_call(call, current_class_name=cls['name'])
                    if callee_id:
                        edges.append({
                            "source": caller_id,
                            "target": callee_id,
                            "type": "CALLS"
                        })
                        
        # Trace calls inside standalone functions
        for fn in ast_data.get('functions', []):
            caller_id = f"{f}#{fn['name']}"
            for call in fn.get('calls', []):
                callee_id = resolve_call(call)
                if callee_id:
                    edges.append({
                        "source": caller_id,
                        "target": callee_id,
                        "type": "CALLS"
                    })
                    
    # Remove duplicate edges to keep graph clean
    unique_edges = []
    seen = set()
    for e in edges:
        edge_key = (e['source'], e['target'], e['type'])
        if edge_key not in seen:
            seen.add(edge_key)
            unique_edges.append(e)
            
    return {
        "nodes": nodes,
        "edges": unique_edges
    }
