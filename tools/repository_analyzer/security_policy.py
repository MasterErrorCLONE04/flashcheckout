import os
import json

def audit_patch_spec(patch_spec, base_dir):
    """
    Audits a proposed code patch against security policy rules (Fase 12.5.1).
    """
    rules_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'policy_rules.json')
    
    rules = {
        "protected_paths": [],
        "blocked_operations": [],
        "require_human_approval": []
    }
    
    if os.path.exists(rules_path):
        try:
            with open(rules_path, 'r', encoding='utf-8') as f:
                rules = json.load(f)
        except Exception:
            pass
            
    file_path = patch_spec.get("file", "").replace('\\', '/')
    code = patch_spec.get("code", "")
    code_lower = code.lower()
    
    # 1. Check protected paths
    for p in rules.get("protected_paths", []):
        if p in file_path:
            return {
                "status": "BLOCKED",
                "reason": f"El archivo objetivo '{file_path}' pertenece a una ruta protegida: '{p}'.",
                "approval_required": True
            }
            
    # 2. Check blocked destructive statements
    for op in rules.get("blocked_operations", []):
        if op in code or op.lower() in code_lower:
            return {
                "status": "BLOCKED",
                "reason": f"Operación destructiva bloqueada detectada: '{op}' en el parche.",
                "approval_required": True
            }
            
    # 3. Check keywords requiring human confirmation
    for term in rules.get("require_human_approval", []):
        if term in code_lower:
            return {
                "status": "WARNING",
                "reason": f"El parche contiene conceptos sensibles de gobernanza: '{term}'. Requiere confirmación humana.",
                "approval_required": True
            }
            
    return {
        "status": "APPROVED",
        "reason": "El parche cumple con todas las políticas de gobernanza activa del repositorio.",
        "approval_required": False
    }
