#!/usr/bin/env python3
"""
Import Cleanup Script for Jason & Co.
Scans for unused imports in Python and TypeScript files.
"""

import ast
import re
from pathlib import Path
from typing import Set, Dict, List, Tuple

class PythonImportCleaner(ast.NodeVisitor):
    """AST visitor to analyze Python imports and usage."""
    
    def __init__(self):
        self.imports: Set[str] = set()
        self.from_imports: Dict[str, str] = {}
        self.used_names: Set[str] = set()
        self.import_lines: List[Tuple[int, str]] = []
        
    def visit_Import(self, node):
        for alias in node.names:
            name = alias.asname if alias.asname else alias.name
            self.imports.add(name)
            self.import_lines.append((node.lineno, f"import {alias.name}"))
            
    def visit_ImportFrom(self, node):
        if node.module:
            for alias in node.names:
                name = alias.asname if alias.asname else alias.name
                self.from_imports[name] = node.module
                self.import_lines.append((node.lineno, f"from {node.module} import {alias.name}"))
                
    def visit_Name(self, node):
        self.used_names.add(node.id)
        
    def visit_Attribute(self, node):
        if isinstance(node.value, ast.Name):
            self.used_names.add(node.value.id)

def analyze_python_file(file_path: Path) -> Tuple[bool, List[str]]:
    """Analyze a Python file for unused imports."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tree = ast.parse(content)
        cleaner = PythonImportCleaner()
        cleaner.visit(tree)
        
        # Find unused imports
        unused_imports = []
        
        # Check regular imports
        for imp in cleaner.imports:
            if imp not in cleaner.used_names:
                unused_imports.append(f"Unused import: {imp}")
        
        # Check from imports
        for name, module in cleaner.from_imports.items():
            if name not in cleaner.used_names:
                unused_imports.append(f"Unused from import: {name} (from {module})")
        
        return len(unused_imports) > 0, unused_imports
        
    except SyntaxError as e:
        return False, [f"Syntax error: {e}"]
    except Exception as e:
        return False, [f"Error analyzing file: {e}"]

def analyze_typescript_file(file_path: Path) -> Tuple[bool, List[str]]:
    """Analyze a TypeScript file for unused imports."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        import_info = []
        unused_imports = []
        
        # Extract import statements
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith('import ') and not line.startswith('import type'):
                import_info.append((i + 1, line))
        
        # Check each import
        for line_num, import_line in import_info:
            # Extract imported identifiers
            imports = extract_ts_imports(import_line)
            content_without_import = '\n'.join(lines[line_num:])  # Content after import
            
            for imported_name in imports:
                # Simple check: if the name appears in the file after the import
                if not re.search(r'\b' + re.escape(imported_name) + r'\b', content_without_import):
                    unused_imports.append(f"Line {line_num}: Potentially unused import '{imported_name}'")
        
        return len(unused_imports) > 0, unused_imports
        
    except Exception as e:
        return False, [f"Error analyzing file: {e}"]

def extract_ts_imports(import_line: str) -> List[str]:
    """Extract imported names from a TypeScript import statement."""
    imports = []
    
    # Handle different import patterns
    patterns = [
        r'import\s+(\w+)\s+from',  # default import
        r'import\s+\{([^}]+)\}',   # named imports
        r'import\s+\*\s+as\s+(\w+)',  # namespace import
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, import_line)
        for match in matches:
            if '{' in import_line and '}' in import_line:
                # Named imports - split by comma
                names = [name.strip().split(' as ')[0] for name in match.split(',')]
                imports.extend(names)
            else:
                imports.append(match)
    
    return [imp.strip() for imp in imports if imp.strip()]

def scan_project_files() -> Tuple[List[Path], List[Path]]:
    """Scan project for Python and TypeScript files."""
    project_root = Path.cwd()
    
    # Python files
    python_files = list(project_root.rglob("*.py"))
    # Filter out virtual environments, __pycache__, etc.
    python_files = [
        f for f in python_files 
        if not any(part in str(f) for part in ['venv', '__pycache__', '.venv', 'env', 'migrations'])
    ]
    
    # TypeScript files
    ts_files = list(project_root.rglob("*.ts")) + list(project_root.rglob("*.tsx"))
    # Filter out node_modules, .next, etc.
    ts_files = [
        f for f in ts_files 
        if not any(part in str(f) for part in ['node_modules', '.next', 'dist', 'build'])
    ]
    
    return python_files, ts_files

def main():
    """Main function to run import cleanup analysis."""
    print("🔍 Jason & Co. Import Cleanup Scanner")
    print("=" * 50)
    
    python_files, ts_files = scan_project_files()
    
    print(f"📁 Found {len(python_files)} Python files")
    print(f"📁 Found {len(ts_files)} TypeScript files")
    print()
    
    # Analyze Python files
    python_issues = 0
    print("🐍 PYTHON FILES:")
    print("-" * 30)
    
    for py_file in python_files:
        has_issues, issues = analyze_python_file(py_file)
        if has_issues:
            python_issues += 1
            rel_path = py_file.relative_to(Path.cwd())
            print(f"\n📄 {rel_path}")
            for issue in issues:
                print(f"  ⚠️  {issue}")
    
    if python_issues == 0:
        print("✅ No unused imports found in Python files!")
    
    # Analyze TypeScript files
    ts_issues = 0
    print(f"\n\n📜 TYPESCRIPT FILES:")
    print("-" * 30)
    
    for ts_file in ts_files:
        has_issues, issues = analyze_typescript_file(ts_file)
        if has_issues:
            ts_issues += 1
            rel_path = ts_file.relative_to(Path.cwd())
            print(f"\n📄 {rel_path}")
            for issue in issues:
                print(f"  ⚠️  {issue}")
    
    if ts_issues == 0:
        print("✅ No unused imports found in TypeScript files!")
    
    # Summary
    print(f"\n\n📊 SUMMARY:")
    print("=" * 50)
    print(f"Python files with issues: {python_issues}/{len(python_files)}")
    print(f"TypeScript files with issues: {ts_issues}/{len(ts_files)}")
    
    if python_issues > 0 or ts_issues > 0:
        print(f"\n💡 CLEANUP RECOMMENDATIONS:")
        print("─" * 30)
        if python_issues > 0:
            print("🐍 Python: Run 'autoflake --remove-all-unused-imports --in-place **/*.py'")
            print("   Or: 'isort --remove-unused-imports **/*.py'")
        if ts_issues > 0:
            print("📜 TypeScript: Run 'eslint --fix **/*.ts **/*.tsx'")
            print("   Or manually remove the reported unused imports")
    else:
        print("🎉 No cleanup needed - your imports are already optimized!")

if __name__ == "__main__":
    main()