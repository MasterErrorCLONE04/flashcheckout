import os
import json
import time
from repository_analyzer.ast_generator import generate_mutation_code

def propose_patch_spec(task, plan, base_dir):
    """
    Translates a task plan steps list into concrete proposed patches (Fase 11.3).
    """
    proposed_patches = []
    
    for idx, step in enumerate(plan.get("steps", [])):
        action = step.get("action")
        file_path = step.get("file")
        
        # Build abstract spec based on task details
        if "applepay" in file_path.lower():
            # Mock spec for Apple Pay adapter creation
            spec = {
                "name": "ApplePayAdapter",
                "implements": "PaymentProvider",
                "methods": [
                    {
                        "name": "charge",
                        "parameters": [{"name": "amount", "type": "number"}],
                        "return_type": "Promise<boolean>",
                        "body": "console.log(`[ApplePayAdapter] Charging ${amount}`);\nreturn true;"
                    }
                ]
            }
            code = generate_mutation_code("CREATE_CLASS", spec)
            proposed_patches.append({
                "patch_id": f"patch_{idx+1:05d}",
                "file": file_path,
                "action": action,
                "code": code
            })
        elif "service" in file_path.lower() or "service.ts" in file_path.lower():
            # Mock spec for method insertion
            spec = {
                "name": "integrateApplePay",
                "parameters": [],
                "return_type": "void",
                "body": "console.log('[CheckoutService] Apple Pay client integrated.');"
            }
            code = generate_mutation_code("ADD_METHOD", spec)
            proposed_patches.append({
                "patch_id": f"patch_{idx+1:05d}",
                "file": file_path,
                "action": action,
                "code": code
            })
            
    return proposed_patches

def apply_patch_spec(patch_spec, base_dir):
    """
    Physically applies the patch block to the target file inside the workspace
    and logs the patch record to patches.json (Fase 11.2).
    """
    file_path = patch_spec.get("file")
    action = patch_spec.get("action")
    code = patch_spec.get("code", "")
    patch_id = patch_spec.get("patch_id", "patch_00001")
    
    full_path = os.path.join(base_dir, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    success = False
    details = ""
    
    if action == "CREATE":
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(code + "\n")
            success = True
            details = f"File created successfully at {file_path}."
        except Exception as e:
            details = f"Failed to create file: {str(e)}"
            
    elif action == "MODIFY":
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Locate the last closing brace class wrapper in the file
                idx = content.rfind('}')
                if idx != -1:
                    modified_content = content[:idx] + "\n" + code + "\n" + content[idx:]
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)
                    success = True
                    details = f"Method successfully appended to class in {file_path}."
                else:
                    details = "Failed to find class enclosing brace block."
            except Exception as e:
                details = f"Failed to modify file: {str(e)}"
        else:
            details = f"Target file to modify {file_path} does not exist."
            
    # Log to patches.json
    patches_path = os.path.join(base_dir, '.repository-ai', 'patches.json')
    os.makedirs(os.path.dirname(patches_path), exist_ok=True)
    patches_list = []
    if os.path.exists(patches_path):
        try:
            with open(patches_path, 'r', encoding='utf-8') as f:
                patches_list = json.load(f)
        except Exception:
            pass
            
    patches_list.append({
        "patch_id": patch_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "file": file_path,
        "action": action,
        "symbols_modified": [patch_spec.get("patch_id")],
        "result": "SUCCESS" if success else "FAILURE",
        "details": details
    })
    
    with open(patches_path, 'w', encoding='utf-8') as f:
        json.dump(patches_list, f, indent=2, ensure_ascii=False)
        
    return {
        "patch_id": patch_id,
        "success": success,
        "details": details
    }
