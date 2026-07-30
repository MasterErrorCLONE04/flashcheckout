import ast
import json
import sys

class PyASTVisitor(ast.NodeVisitor):
    def __init__(self):
        self.classes = []
        self.functions = []
        self.imports = []
        self.exports = []
        self.current_class = None
        self.current_func_or_method = None

    def _resolve_expr_name(self, node):
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            val = self._resolve_expr_name(node.value)
            return f"{val}.{node.attr}" if val else node.attr
        elif isinstance(node, ast.Call):
            val = self._resolve_expr_name(node.func)
            return f"{val}()" if val else ""
        return ""

    def _unparse_node(self, node):
        if not node:
            return "any"
        try:
            return ast.unparse(node).strip()
        except AttributeError:
            if isinstance(node, ast.Name):
                return node.id
            elif isinstance(node, ast.Attribute):
                return f"{self._unparse_node(node.value)}.{node.attr}"
            return "any"

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append({
                "source": alias.name,
                "symbols": [{"name": alias.asname or alias.name, "kind": "import"}]
            })
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        source = node.module or ""
        symbols = []
        for alias in node.names:
            symbols.append({
                "name": alias.asname or alias.name,
                "propertyName": alias.name if alias.asname else None,
                "kind": "named"
            })
        self.imports.append({
            "source": source,
            "level": node.level,
            "symbols": symbols
        })
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_obj = {
            "name": node.name,
            "decorators": [self._resolve_expr_name(dec) or self._unparse_node(dec) for dec in node.decorator_list],
            "docstring": ast.get_docstring(node) or "",
            "methods": []
        }
        self.classes.append(class_obj)
        
        # Public root-level exports
        if not self.current_class and not self.current_func_or_method and not node.name.startswith('_'):
            self.exports.append({"name": node.name, "kind": "class"})
            
        prev_class = self.current_class
        self.current_class = class_obj
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_FunctionDef(self, node):
        parameters = []
        for arg in node.args.args:
            if arg.arg == 'self':
                continue
            param_type = self._unparse_node(arg.annotation) if arg.annotation else "any"
            parameters.append({
                "name": arg.arg,
                "type": param_type
            })

        func_obj = {
            "name": node.name,
            "parameters": parameters,
            "return_type": self._unparse_node(node.returns) if node.returns else "any",
            "decorators": [self._resolve_expr_name(dec) or self._unparse_node(dec) for dec in node.decorator_list],
            "docstring": ast.get_docstring(node) or "",
            "calls": []
        }
        if self.current_class:
            self.current_class["methods"].append(func_obj)
        else:
            self.functions.append(func_obj)
            # Public root-level exports
            if not self.current_class and not self.current_func_or_method and not node.name.startswith('_'):
                self.exports.append({"name": node.name, "kind": "function"})

        prev_func = self.current_func_or_method
        self.current_func_or_method = func_obj
        self.generic_visit(node)
        self.current_func_or_method = prev_func

    def visit_AsyncFunctionDef(self, node):
        self.visit_FunctionDef(node)

    def visit_Call(self, node):
        call_name = self._resolve_expr_name(node.func)
        if call_name and self.current_func_or_method:
            self.current_func_or_method["calls"].append(call_name)
        self.generic_visit(node)

def parse_python_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        tree = ast.parse(content, filename=file_path)
        visitor = PyASTVisitor()
        visitor.visit(tree)
        
        return {
            "file": file_path,
            "classes": visitor.classes,
            "functions": visitor.functions,
            "imports": visitor.imports,
            "exports": visitor.exports
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing file path argument."}))
        sys.exit(1)
        
    result = parse_python_file(sys.argv[1])
    print(json.dumps(result, indent=2))
