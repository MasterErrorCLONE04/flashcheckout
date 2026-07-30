import os
import json
import re

def create_change_plan(task, base_dir):
    """
    Parses a task request, maps to domain/patterns in history, and compiles
    a structured change plan detailing step-by-step operations (Fase 9.1).
    """
    history_path = os.path.join(base_dir, '.repository-ai', 'history.json')
    decisions_path = os.path.join(base_dir, '.repository-ai', 'decisions.json')
    context_map_path = os.path.join(base_dir, '.repository-ai', 'context-map.json')
    
    # Load metadata
    decisions = []
    if os.path.exists(decisions_path):
        try:
            with open(decisions_path, 'r', encoding='utf-8') as f:
                decisions = json.load(f)
        except Exception:
            pass
            
    task_lower = task.lower()
    intent = "Mantenimiento General"
    domain = "General"
    existing_patterns = []
    affected_modules = []
    steps = []
    
    # 1. Map intent and suggest patterns from ADR decisions
    if any(term in task_lower for term in ['stripe', 'payment', 'pago', 'mercadopago', 'checkout', 'apple pay', 'druo']):
        intent = "Agregar nuevo proveedor de pago"
        domain = "Payments"
        affected_modules = ["checkout", "payments", "webhooks"]
        
        # Look for Adapter/Payment patterns in decisions
        existing_patterns = ["Adapter Pattern", "PaymentProvider Interface"]
        for adr in decisions:
            if 'adapter' in adr.get('title', '').lower() or 'payment' in adr.get('title', '').lower():
                existing_patterns.append(adr.get('title'))
                
        # Generate plan steps
        if 'apple pay' in task_lower:
            steps = [
                {"action": "CREATE", "file": "lib/payments/applepay.ts", "reason": "Implementar el adaptador de Apple Pay siguiendo la interfaz PaymentProvider."},
                {"action": "MODIFY", "file": "lib/checkout/service.ts", "reason": "Integrar el nuevo ApplePayAdapter en la canalización del checkout."}
            ]
        elif 'mercadopago' in task_lower or 'mp' in task_lower:
            steps = [
                {"action": "CREATE", "file": "lib/payments/mercadopago.ts", "reason": "Implementar el adaptador de Mercado Pago."},
                {"action": "CREATE", "file": "app/api/webhooks/mp/route.ts", "reason": "Crear endpoint de callback para notificaciones instantáneas de pago (IPN)."}
            ]
        else:
            steps = [
                {"action": "CREATE", "file": "lib/payments/gateway.ts", "reason": "Crear adaptador genérico de pago."}
            ]
            
    elif any(term in task_lower for term in ['auth', 'login', 'oauth', 'token', 'user']):
        intent = "Implementar mecanismo de seguridad / Autenticación"
        domain = "Security"
        affected_modules = ["auth", "middleware", "users"]
        existing_patterns = ["Middleware Guard", "Session tokens validation"]
        steps = [
            {"action": "MODIFY", "file": "middleware.ts", "reason": "Añadir reglas de protección de rutas privadas."},
            {"action": "MODIFY", "file": "lib/auth.ts", "reason": "Añadir soporte para el nuevo flujo de tokens en el SessionManager."}
        ]
        
    else:
        # Generic step inference
        intent = "Refactorización / Ampliación funcional"
        domain = "Core"
        affected_modules = ["lib", "app"]
        steps = [
            {"action": "MODIFY", "file": "lib/ai/pipeline/tools.ts", "reason": "Modificar el símbolo de negocio correspondiente."}
        ]
        
    return {
        "intent": intent,
        "domain": domain,
        "existing_patterns": list(set(existing_patterns)),
        "affected_modules": affected_modules,
        "steps": steps,
        "recommendation": "Siga la arquitectura de adaptadores existente. No modifique los manejadores del core directamente."
    }

def verify_change_consequences(base_dir, before_score, after_score, before_complexity, after_complexity, tests_passed=True):
    """
    Compares before/after statistics to reject or approve modifications based on
    architectural score degradation, complexity increase and unit tests status (Fase 9.3).
    """
    status = "APPROVED"
    reasons = []
    
    # Check score degradation
    score_diff = after_score - before_score
    if score_diff < -3:
        status = "REJECTED"
        reasons.append(f"Degradación crítica en el Score de AI Readiness: {score_diff} puntos (Evitar acoplamientos).")
        
    # Check complexity increase
    complexity_diff = after_complexity - before_complexity
    if complexity_diff > 5:
        status = "REJECTED"
        reasons.append(f"Aumento excesivo de la complejidad ciclomática: +{complexity_diff} (Refactorizar en submódulos).")
        
    if not tests_passed:
        status = "REJECTED"
        reasons.append("Fallo en la ejecución de pruebas unitarias (Rollback automático requerido).")
        
    if status == "APPROVED":
        reasons.append("Las métricas de diseño se mantienen estables. Modificación arquitectónica exitosa.")
        
    return {
        "status": status,
        "score_differential": score_diff,
        "complexity_differential": complexity_diff,
        "reasons": reasons
    }
