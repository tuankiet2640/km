"""
Code Analysis Service - DeepWiki inspired features
Analyzes code repositories, generates documentation, and creates visual diagrams.
"""

import os
import ast
import json
import asyncio
import tempfile
from typing import Dict, List, Any, Optional, Set, Tuple
from pathlib import Path
import shutil
import re
from collections import defaultdict

import git
import aiofiles
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer_for_filename
from pygments.formatters import HtmlFormatter
from pygments.util import ClassNotFound
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript
from tree_sitter import Language, Parser
import radon.complexity as radon_complexity
import radon.metrics as radon_metrics
from vulture import Vulture
import bandit
from flake8.api.legacy import get_style_guide
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
import graphviz
from astroid import builder, nodes

from app.core.config import settings
from app.services.embedding_service import EmbeddingService


# Set matplotlib to use non-interactive backend
matplotlib.use('Agg')


class CodeAnalyzer:
    """Comprehensive code analysis service with DeepWiki-style features."""
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.supported_languages = {
            '.py': 'python',
            '.js': 'javascript', 
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.cs': 'csharp',
            '.swift': 'swift',
            '.kt': 'kotlin'
        }
        self._setup_tree_sitter()
    
    def _setup_tree_sitter(self):
        """Initialize Tree-sitter parsers for different languages."""
        try:
            # Create parsers for supported languages
            self.parsers = {}
            
            # Python parser
            PY_LANGUAGE = Language(tspython.language())
            py_parser = Parser()
            py_parser.set_language(PY_LANGUAGE)
            self.parsers['python'] = py_parser
            
            # JavaScript parser
            JS_LANGUAGE = Language(tsjavascript.language())
            js_parser = Parser()
            js_parser.set_language(JS_LANGUAGE)
            self.parsers['javascript'] = js_parser
            
            # TypeScript parser
            TS_LANGUAGE = Language(tstypescript.language())
            ts_parser = Parser()
            ts_parser.set_language(TS_LANGUAGE)
            self.parsers['typescript'] = ts_parser
            
        except Exception as e:
            print(f"Warning: Tree-sitter setup failed: {e}")
            self.parsers = {}

    async def clone_repository(self, repo_url: str, target_dir: str) -> str:
        """Clone a repository to the target directory."""
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir)
        
        # Create target directory
        os.makedirs(target_dir, exist_ok=True)
        
        try:
            # Clone repository
            repo = git.Repo.clone_from(repo_url, target_dir)
            return target_dir
        except Exception as e:
            raise Exception(f"Failed to clone repository: {str(e)}")

    async def analyze_repository(self, repo_path: str) -> Dict[str, Any]:
        """Perform comprehensive analysis of a repository."""
        analysis_result = {
            "overview": await self._get_repository_overview(repo_path),
            "structure": await self._analyze_structure(repo_path),
            "files": await self._analyze_files(repo_path),
            "dependencies": await self._analyze_dependencies(repo_path),
            "metrics": await self._calculate_metrics(repo_path),
            "security": await self._security_analysis(repo_path),
            "documentation": await self._generate_documentation(repo_path),
            "diagrams": await self._generate_diagrams(repo_path)
        }
        
        return analysis_result

    async def _get_repository_overview(self, repo_path: str) -> Dict[str, Any]:
        """Get basic repository information."""
        try:
            repo = git.Repo(repo_path)
            
            # Get commit history
            commits = list(repo.iter_commits(max_count=10))
            
            # Get branches
            branches = [branch.name for branch in repo.branches]
            
            # Get file statistics
            total_files = 0
            total_lines = 0
            language_stats = defaultdict(int)
            
            for root, dirs, files in os.walk(repo_path):
                # Skip .git directory
                if '.git' in root:
                    continue
                    
                for file in files:
                    total_files += 1
                    file_path = os.path.join(root, file)
                    ext = os.path.splitext(file)[1].lower()
                    
                    if ext in self.supported_languages:
                        language_stats[self.supported_languages[ext]] += 1
                        
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                lines = len(f.readlines())
                                total_lines += lines
                        except:
                            pass
            
            return {
                "total_files": total_files,
                "total_lines": total_lines,
                "languages": dict(language_stats),
                "recent_commits": [
                    {
                        "hash": commit.hexsha[:8],
                        "message": commit.message.strip(),
                        "author": commit.author.name,
                        "date": commit.committed_datetime.isoformat()
                    }
                    for commit in commits
                ],
                "branches": branches,
                "active_branch": repo.active_branch.name if repo.active_branch else "main"
            }
        except Exception as e:
            return {"error": f"Failed to get repository overview: {str(e)}"}

    async def _analyze_structure(self, repo_path: str) -> Dict[str, Any]:
        """Analyze repository structure and create directory tree."""
        structure = {}
        
        def build_tree(path: str, max_depth: int = 3, current_depth: int = 0) -> Dict:
            if current_depth > max_depth:
                return {"truncated": True}
                
            tree = {}
            try:
                for item in os.listdir(path):
                    if item.startswith('.') and item not in ['.env', '.env.example']:
                        continue
                        
                    item_path = os.path.join(path, item)
                    if os.path.isdir(item_path):
                        tree[f"{item}/"] = build_tree(item_path, max_depth, current_depth + 1)
                    else:
                        ext = os.path.splitext(item)[1].lower()
                        tree[item] = {
                            "type": "file",
                            "language": self.supported_languages.get(ext, "unknown"),
                            "size": os.path.getsize(item_path)
                        }
            except PermissionError:
                tree["error"] = "Permission denied"
                
            return tree
        
        structure = build_tree(repo_path)
        
        # Generate Mermaid diagram for directory structure
        mermaid_diagram = self._generate_structure_diagram(structure)
        
        return {
            "tree": structure,
            "mermaid_diagram": mermaid_diagram
        }

    def _generate_structure_diagram(self, structure: Dict, prefix: str = "") -> str:
        """Generate Mermaid diagram for repository structure."""
        lines = ["graph TD"]
        
        def add_nodes(node_dict: Dict, parent_id: str = "root", level: int = 0):
            if level > 2:  # Limit depth for readability
                return
                
            for name, content in node_dict.items():
                if name == "truncated" or name == "error":
                    continue
                    
                # Clean name for diagram
                clean_name = re.sub(r'[^a-zA-Z0-9]', '_', name)
                node_id = f"{parent_id}_{clean_name}"
                
                if isinstance(content, dict):
                    if content.get("type") == "file":
                        # File node
                        lang = content.get("language", "unknown")
                        lines.append(f'    {node_id}["{name}<br/>({lang})"]')
                        lines.append(f'    {parent_id} --> {node_id}')
                    else:
                        # Directory node
                        lines.append(f'    {node_id}["{name}"]')
                        lines.append(f'    {parent_id} --> {node_id}')
                        add_nodes(content, node_id, level + 1)
        
        lines.append('    root["Repository Root"]')
        add_nodes(structure)
        
        return "\n".join(lines)

    async def _analyze_files(self, repo_path: str) -> List[Dict[str, Any]]:
        """Analyze individual files in the repository."""
        files_analysis = []
        
        for root, dirs, files in os.walk(repo_path):
            # Skip .git and other hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            if '.git' in root:
                continue
                
            for file in files:
                if file.startswith('.'):
                    continue
                    
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, repo_path)
                ext = os.path.splitext(file)[1].lower()
                
                if ext in self.supported_languages:
                    analysis = await self._analyze_single_file(file_path, relative_path)
                    if analysis:
                        files_analysis.append(analysis)
        
        return files_analysis

    async def _analyze_single_file(self, file_path: str, relative_path: str) -> Optional[Dict[str, Any]]:
        """Analyze a single file."""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = await f.read()
            
            ext = os.path.splitext(file_path)[1].lower()
            language = self.supported_languages.get(ext, 'unknown')
            
            analysis = {
                "path": relative_path,
                "language": language,
                "size": len(content),
                "lines": len(content.splitlines()),
                "functions": [],
                "classes": [],
                "imports": [],
                "complexity": None,
                "highlighted_code": None
            }
            
            # Language-specific analysis
            if language == 'python':
                analysis.update(await self._analyze_python_file(content))
            elif language in ['javascript', 'typescript']:
                analysis.update(await self._analyze_js_ts_file(content, language))
            
            # Generate highlighted code
            try:
                lexer = get_lexer_by_name(language)
                formatter = HtmlFormatter(style='github')
                analysis["highlighted_code"] = highlight(content, lexer, formatter)
            except ClassNotFound:
                analysis["highlighted_code"] = f"<pre><code>{content}</code></pre>"
            
            return analysis
            
        except Exception as e:
            return {
                "path": relative_path,
                "error": f"Failed to analyze file: {str(e)}"
            }

    async def _analyze_python_file(self, content: str) -> Dict[str, Any]:
        """Analyze Python file using AST."""
        analysis = {
            "functions": [],
            "classes": [],
            "imports": [],
            "complexity": None
        }
        
        try:
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    analysis["functions"].append({
                        "name": node.name,
                        "line": node.lineno,
                        "args": [arg.arg for arg in node.args.args],
                        "decorators": [d.id if isinstance(d, ast.Name) else str(d) for d in node.decorator_list],
                        "docstring": ast.get_docstring(node)
                    })
                
                elif isinstance(node, ast.ClassDef):
                    methods = [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                    analysis["classes"].append({
                        "name": node.name,
                        "line": node.lineno,
                        "methods": methods,
                        "bases": [b.id if isinstance(b, ast.Name) else str(b) for b in node.bases],
                        "docstring": ast.get_docstring(node)
                    })
                
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            analysis["imports"].append({
                                "module": alias.name,
                                "alias": alias.asname,
                                "line": node.lineno
                            })
                    else:  # ImportFrom
                        for alias in node.names:
                            analysis["imports"].append({
                                "module": node.module,
                                "name": alias.name,
                                "alias": alias.asname,
                                "line": node.lineno
                            })
            
            # Calculate complexity using radon
            try:
                complexity_results = radon_complexity.cc_visit(content)
                analysis["complexity"] = [
                    {
                        "name": result.name,
                        "complexity": result.complexity,
                        "line": result.lineno
                    }
                    for result in complexity_results
                ]
            except:
                pass
                
        except SyntaxError as e:
            analysis["syntax_error"] = {
                "message": str(e),
                "line": e.lineno
            }
        except Exception as e:
            analysis["analysis_error"] = str(e)
        
        return analysis

    async def _analyze_js_ts_file(self, content: str, language: str) -> Dict[str, Any]:
        """Analyze JavaScript/TypeScript file using Tree-sitter."""
        analysis = {
            "functions": [],
            "classes": [],
            "imports": [],
            "exports": []
        }
        
        try:
            if language in self.parsers:
                parser = self.parsers[language]
                tree = parser.parse(content.encode('utf-8'))
                
                def traverse_tree(node, depth=0):
                    if depth > 10:  # Prevent infinite recursion
                        return
                        
                    if node.type == 'function_declaration':
                        func_name = None
                        for child in node.children:
                            if child.type == 'identifier':
                                func_name = content[child.start_byte:child.end_byte]
                                break
                        
                        if func_name:
                            analysis["functions"].append({
                                "name": func_name,
                                "line": node.start_point[0] + 1,
                                "type": "function_declaration"
                            })
                    
                    elif node.type == 'class_declaration':
                        class_name = None
                        for child in node.children:
                            if child.type == 'identifier':
                                class_name = content[child.start_byte:child.end_byte]
                                break
                        
                        if class_name:
                            analysis["classes"].append({
                                "name": class_name,
                                "line": node.start_point[0] + 1,
                                "type": "class_declaration"
                            })
                    
                    elif node.type in ['import_statement', 'import_declaration']:
                        import_text = content[node.start_byte:node.end_byte]
                        analysis["imports"].append({
                            "statement": import_text,
                            "line": node.start_point[0] + 1
                        })
                    
                    elif node.type in ['export_statement', 'export_declaration']:
                        export_text = content[node.start_byte:node.end_byte]
                        analysis["exports"].append({
                            "statement": export_text,
                            "line": node.start_point[0] + 1
                        })
                    
                    # Recursively traverse children
                    for child in node.children:
                        traverse_tree(child, depth + 1)
                
                traverse_tree(tree.root_node)
        
        except Exception as e:
            analysis["analysis_error"] = str(e)
        
        return analysis

    async def _analyze_dependencies(self, repo_path: str) -> Dict[str, Any]:
        """Analyze project dependencies."""
        dependencies = {
            "python": {},
            "javascript": {},
            "other": {}
        }
        
        # Python dependencies
        requirements_files = ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile']
        for req_file in requirements_files:
            req_path = os.path.join(repo_path, req_file)
            if os.path.exists(req_path):
                try:
                    async with aiofiles.open(req_path, 'r', encoding='utf-8') as f:
                        content = await f.read()
                    dependencies["python"][req_file] = await self._parse_python_dependencies(content, req_file)
                except:
                    pass
        
        # JavaScript dependencies
        package_json_path = os.path.join(repo_path, 'package.json')
        if os.path.exists(package_json_path):
            try:
                async with aiofiles.open(package_json_path, 'r', encoding='utf-8') as f:
                    content = await f.read()
                package_data = json.loads(content)
                dependencies["javascript"]["package.json"] = {
                    "dependencies": package_data.get("dependencies", {}),
                    "devDependencies": package_data.get("devDependencies", {}),
                    "scripts": package_data.get("scripts", {})
                }
            except:
                pass
        
        return dependencies

    async def _parse_python_dependencies(self, content: str, filename: str) -> Dict[str, Any]:
        """Parse Python dependency files."""
        if filename == 'requirements.txt':
            deps = {}
            for line in content.splitlines():
                line = line.strip()
                if line and not line.startswith('#'):
                    if '==' in line:
                        name, version = line.split('==', 1)
                        deps[name.strip()] = version.strip()
                    elif '>=' in line:
                        name, version = line.split('>=', 1)
                        deps[name.strip()] = f">={version.strip()}"
                    else:
                        deps[line] = "latest"
            return {"dependencies": deps}
        
        elif filename == 'pyproject.toml':
            # Basic TOML parsing for dependencies
            deps = {}
            in_dependencies = False
            for line in content.splitlines():
                line = line.strip()
                if line == '[dependencies]' or line == '[tool.poetry.dependencies]':
                    in_dependencies = True
                    continue
                elif line.startswith('[') and in_dependencies:
                    in_dependencies = False
                elif in_dependencies and '=' in line:
                    try:
                        name, version = line.split('=', 1)
                        deps[name.strip()] = version.strip().strip('"\'')
                    except:
                        pass
            return {"dependencies": deps}
        
        return {"raw_content": content}

    async def _calculate_metrics(self, repo_path: str) -> Dict[str, Any]:
        """Calculate various code metrics."""
        metrics = {
            "overview": {
                "total_files": 0,
                "total_lines": 0,
                "total_characters": 0,
                "languages": {}
            },
            "complexity": {},
            "maintainability": {},
            "test_coverage": {}
        }
        
        language_stats = defaultdict(lambda: {"files": 0, "lines": 0})
        
        for root, dirs, files in os.walk(repo_path):
            if '.git' in root:
                continue
                
            for file in files:
                if file.startswith('.'):
                    continue
                    
                file_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1].lower()
                
                if ext in self.supported_languages:
                    language = self.supported_languages[ext]
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            lines = len(content.splitlines())
                            
                        metrics["overview"]["total_files"] += 1
                        metrics["overview"]["total_lines"] += lines
                        metrics["overview"]["total_characters"] += len(content)
                        
                        language_stats[language]["files"] += 1
                        language_stats[language]["lines"] += lines
                        
                        # Python-specific metrics
                        if language == 'python':
                            await self._calculate_python_metrics(content, file_path, metrics)
                            
                    except:
                        pass
        
        metrics["overview"]["languages"] = dict(language_stats)
        return metrics

    async def _calculate_python_metrics(self, content: str, file_path: str, metrics: Dict):
        """Calculate Python-specific metrics."""
        try:
            # Complexity metrics using radon
            complexity_results = radon_complexity.cc_visit(content)
            if complexity_results:
                avg_complexity = sum(r.complexity for r in complexity_results) / len(complexity_results)
                metrics["complexity"][file_path] = {
                    "average": avg_complexity,
                    "functions": [
                        {"name": r.name, "complexity": r.complexity}
                        for r in complexity_results
                    ]
                }
            
            # Maintainability index
            mi_score = radon_metrics.mi_visit(content, multi=True)
            if mi_score:
                metrics["maintainability"][file_path] = mi_score
                
        except:
            pass

    async def _security_analysis(self, repo_path: str) -> Dict[str, Any]:
        """Perform security analysis of the repository."""
        security_issues = {
            "summary": {
                "total_issues": 0,
                "high_severity": 0,
                "medium_severity": 0,
                "low_severity": 0
            },
            "issues": []
        }
        
        # TODO: Implement security scanning using bandit for Python files
        # This would require more sophisticated setup
        
        return security_issues

    async def _generate_documentation(self, repo_path: str) -> Dict[str, Any]:
        """Generate comprehensive documentation for the repository."""
        docs = {
            "readme": await self._extract_readme(repo_path),
            "api_documentation": await self._generate_api_docs(repo_path),
            "structure_overview": await self._generate_structure_overview(repo_path),
            "getting_started": await self._generate_getting_started(repo_path)
        }
        
        return docs

    async def _extract_readme(self, repo_path: str) -> Optional[str]:
        """Extract and parse README file."""
        readme_files = ['README.md', 'README.rst', 'README.txt', 'readme.md']
        
        for readme_file in readme_files:
            readme_path = os.path.join(repo_path, readme_file)
            if os.path.exists(readme_path):
                try:
                    async with aiofiles.open(readme_path, 'r', encoding='utf-8') as f:
                        return await f.read()
                except:
                    pass
        
        return None

    async def _generate_api_docs(self, repo_path: str) -> List[Dict[str, Any]]:
        """Generate API documentation from code analysis."""
        api_docs = []
        
        # This would analyze functions, classes, and methods to generate API docs
        # Implementation would depend on the specific language and framework
        
        return api_docs

    async def _generate_structure_overview(self, repo_path: str) -> str:
        """Generate a comprehensive overview of the project structure."""
        overview = [
            "# Project Structure Overview\n",
            "This document provides an overview of the project structure and key components.\n"
        ]
        
        # Analyze main directories and their purposes
        main_dirs = []
        for item in os.listdir(repo_path):
            if os.path.isdir(os.path.join(repo_path, item)) and not item.startswith('.'):
                main_dirs.append(item)
        
        if main_dirs:
            overview.append("## Main Directories\n")
            for dir_name in sorted(main_dirs):
                purpose = self._infer_directory_purpose(dir_name)
                overview.append(f"- **{dir_name}/**: {purpose}")
        
        return "\n".join(overview)

    def _infer_directory_purpose(self, dir_name: str) -> str:
        """Infer the purpose of a directory based on its name."""
        dir_purposes = {
            'src': 'Source code directory',
            'lib': 'Library files',
            'app': 'Application code',
            'api': 'API endpoints and routes',
            'components': 'Reusable UI components',
            'services': 'Business logic and services',
            'models': 'Data models and schemas',
            'utils': 'Utility functions and helpers',
            'config': 'Configuration files',
            'tests': 'Test files and test suites',
            'docs': 'Documentation files',
            'static': 'Static assets (CSS, JS, images)',
            'public': 'Public files served by web server',
            'build': 'Build artifacts and compiled files',
            'dist': 'Distribution files',
            'node_modules': 'Node.js dependencies',
            'vendor': 'Third-party dependencies',
            'assets': 'Project assets and resources',
            'scripts': 'Build and utility scripts',
            'tools': 'Development tools',
            'migrations': 'Database migration files',
            'templates': 'Template files',
            'views': 'View components or templates',
            'controllers': 'Controller classes',
            'middleware': 'Middleware functions',
            'routes': 'Route definitions',
            'database': 'Database related files',
            'storage': 'File storage directory',
            'logs': 'Log files',
            'cache': 'Cache files',
            'tmp': 'Temporary files',
            'backup': 'Backup files'
        }
        
        return dir_purposes.get(dir_name.lower(), 'Project directory')

    async def _generate_getting_started(self, repo_path: str) -> str:
        """Generate a getting started guide based on project files."""
        guide = ["# Getting Started\n"]
        
        # Check for common setup files
        setup_files = {
            'package.json': 'npm install',
            'requirements.txt': 'pip install -r requirements.txt',
            'Pipfile': 'pipenv install',
            'pyproject.toml': 'pip install -e .',
            'Dockerfile': 'docker build -t project .',
            'docker-compose.yml': 'docker-compose up',
            'Makefile': 'make install',
            'setup.py': 'python setup.py install'
        }
        
        found_commands = []
        for file, command in setup_files.items():
            if os.path.exists(os.path.join(repo_path, file)):
                found_commands.append(f"```bash\n{command}\n```")
        
        if found_commands:
            guide.append("## Installation\n")
            guide.extend(found_commands)
        
        return "\n".join(guide)

    async def _generate_diagrams(self, repo_path: str) -> Dict[str, str]:
        """Generate various diagrams for the repository."""
        diagrams = {}
        
        # Generate architecture diagram
        diagrams["architecture"] = await self._generate_architecture_diagram(repo_path)
        
        # Generate dependency diagram
        diagrams["dependencies"] = await self._generate_dependency_diagram(repo_path)
        
        # Generate data flow diagram
        diagrams["dataflow"] = await self._generate_dataflow_diagram(repo_path)
        
        return diagrams

    async def _generate_architecture_diagram(self, repo_path: str) -> str:
        """Generate Mermaid architecture diagram."""
        # This is a simplified implementation
        # A more sophisticated version would analyze imports and dependencies
        
        diagram = [
            "graph TB",
            "    subgraph \"Application Layer\"",
            "        A[Frontend]",
            "        B[API Gateway]",
            "    end",
            "    subgraph \"Business Layer\"",
            "        C[Services]",
            "        D[Controllers]",
            "    end",
            "    subgraph \"Data Layer\"",
            "        E[Models]",
            "        F[Database]",
            "    end",
            "    A --> B",
            "    B --> C",
            "    C --> D",
            "    D --> E",
            "    E --> F"
        ]
        
        return "\n".join(diagram)

    async def _generate_dependency_diagram(self, repo_path: str) -> str:
        """Generate dependency relationship diagram."""
        diagram = [
            "graph LR",
            "    A[Main Application] --> B[Core Services]",
            "    B --> C[Database Layer]",
            "    B --> D[External APIs]",
            "    A --> E[UI Components]",
            "    E --> F[State Management]"
        ]
        
        return "\n".join(diagram)

    async def _generate_dataflow_diagram(self, repo_path: str) -> str:
        """Generate data flow diagram."""
        diagram = [
            "flowchart TD",
            "    A[User Input] --> B[Input Validation]",
            "    B --> C[Business Logic]",
            "    C --> D[Data Processing]",
            "    D --> E[Database Storage]",
            "    D --> F[Response Generation]",
            "    F --> G[User Output]"
        ]
        
        return "\n".join(diagram)

    async def chat_with_repository(self, repo_path: str, query: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """RAG-powered chat with repository codebase."""
        try:
            # Index repository if not already done
            await self._index_repository_for_rag(repo_path)
            
            # Search for relevant code snippets
            relevant_code = await self._search_relevant_code(repo_path, query)
            
            # Generate response using LLM with context
            response = await self._generate_chat_response(query, relevant_code, conversation_history)
            
            return {
                "response": response,
                "relevant_files": [code["file"] for code in relevant_code],
                "context_used": len(relevant_code)
            }
        except Exception as e:
            return {"error": f"Chat failed: {str(e)}"}

    async def _index_repository_for_rag(self, repo_path: str):
        """Index repository code for RAG retrieval."""
        # This would create embeddings for code chunks
        # Implementation would use the embedding service
        pass

    async def _search_relevant_code(self, repo_path: str, query: str) -> List[Dict[str, Any]]:
        """Search for code relevant to the query."""
        # This would use vector similarity search
        # Placeholder implementation
        return [
            {
                "file": "example.py",
                "content": "# Relevant code snippet",
                "similarity": 0.85
            }
        ]

    async def _generate_chat_response(self, query: str, relevant_code: List[Dict], conversation_history: List[Dict] = None) -> str:
        """Generate chat response using LLM."""
        # This would use the LLM service to generate responses
        # Placeholder implementation
        return f"Based on the code analysis, here's what I found regarding: {query}" 