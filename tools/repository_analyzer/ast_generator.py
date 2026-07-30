import json

def reconstruct_method(name, params, return_type, body, is_async=True):
    """
    Generates a TypeScript method block.
    """
    params_str = ", ".join([f"{p['name']}: {p['type']}" for p in params])
    prefix = "async " if is_async else ""
    # Ensure correct body indentation
    indented_body = "\n    ".join(body.split('\n'))
    return f"  {prefix}{name}({params_str}): {return_type} {{\n    {indented_body}\n  }}"

def reconstruct_class(name, implements, methods_code):
    """
    Generates a TypeScript class block.
    """
    impl_str = f" implements {implements}" if implements else ""
    methods_str = "\n\n".join(methods_code)
    return f"export class {name}{impl_str} {{\n{methods_str}\n}}"

def reconstruct_import(symbols, source):
    """
    Generates a TypeScript import statement.
    """
    syms_str = ", ".join(symbols)
    return f"import {{ {syms_str} }} from '{source}'"

def generate_mutation_code(operation, spec):
    """
    Translates an abstract mutation spec into raw TypeScript.
    """
    op_type = operation.upper()
    
    if op_type == "ADD_METHOD":
        return reconstruct_method(
            spec.get("name"),
            spec.get("parameters", []),
            spec.get("return_type", "any"),
            spec.get("body", "throw new Error('Not implemented');"),
            spec.get("is_async", True)
        )
    elif op_type == "CREATE_CLASS":
        methods = []
        for m in spec.get("methods", []):
            methods.append(reconstruct_method(
                m.get("name"),
                m.get("parameters", []),
                m.get("return_type", "any"),
                m.get("body", "throw new Error('Not implemented');"),
                m.get("is_async", True)
            ))
        return reconstruct_class(
            spec.get("name"),
            spec.get("implements"),
            methods
        )
    elif op_type == "REFACTOR_IMPORT":
        return reconstruct_import(
            spec.get("symbols", []),
            spec.get("source")
        )
    else:
        return ""
