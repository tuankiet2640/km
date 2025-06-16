"""
Workflow Engine Service for AI Knowledge Platform.
Handles workflow execution, orchestration, and node processing.
"""

import asyncio
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.workflow import (
    Workflow, WorkflowExecution, NodeExecution, 
    WorkflowStatus, NodeType
)
from app.models.chat import Chat, ChatMessage
from app.services.rag import RAGService
from app.services.mcp_client import MCPClientService
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)


class WorkflowEngineService:
    """Service for executing workflows and managing workflow state."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rag_service = RAGService(db)
        self.mcp_service = MCPClientService()
        
    async def execute_workflow(
        self,
        workflow_id: UUID,
        input_data: Dict[str, Any],
        chat_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None
    ) -> WorkflowExecution:
        """Execute a workflow with given input data."""
        
        # Load workflow
        workflow = await self._get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Create execution instance
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            input_data=input_data,
            started_by_id=user_id,
            chat_id=chat_id,
            execution_context={"variables": workflow.variables.copy()}
        )
        
        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)
        
        try:
            # Execute workflow nodes
            await self._execute_workflow_nodes(execution, workflow)
            
            # Update execution status
            execution.status = WorkflowStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            execution.status = WorkflowStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
            
        await self.db.commit()
        return execution
    
    async def _execute_workflow_nodes(
        self, 
        execution: WorkflowExecution, 
        workflow: Workflow
    ) -> None:
        """Execute all nodes in the workflow according to the flow."""
        
        nodes = {node["id"]: node for node in workflow.nodes}
        edges = workflow.edges
        
        # Find start node
        start_node = next((node for node in workflow.nodes if node["type"] == "start"), None)
        if not start_node:
            raise ValueError("No start node found in workflow")
        
        current_node_id = start_node["id"]
        execution_context = execution.execution_context
        
        while current_node_id:
            node = nodes.get(current_node_id)
            if not node:
                break
                
            # Execute current node
            node_execution = await self._execute_node(
                execution, node, execution_context
            )
            
            # Update execution context with node output
            if node_execution.output_data:
                execution_context.update(node_execution.output_data)
            
            # Find next node based on edges and conditions
            current_node_id = await self._get_next_node(
                current_node_id, edges, execution_context
            )
            
            # Update current node in execution
            execution.current_node_id = current_node_id
            await self.db.commit()
    
    async def _execute_node(
        self,
        execution: WorkflowExecution,
        node: Dict[str, Any],
        context: Dict[str, Any]
    ) -> NodeExecution:
        """Execute a single workflow node."""
        
        start_time = time.time()
        
        node_execution = NodeExecution(
            workflow_execution_id=execution.id,
            node_id=node["id"],
            node_type=NodeType(node["type"]),
            node_name=node.get("name", ""),
            input_data=context.copy()
        )
        
        self.db.add(node_execution)
        
        try:
            # Execute based on node type
            if node["type"] == "start":
                output_data = await self._execute_start_node(node, context)
            elif node["type"] == "ai_chat":
                output_data = await self._execute_ai_chat_node(node, context, execution)
            elif node["type"] == "knowledge_retrieval":
                output_data = await self._execute_knowledge_retrieval_node(node, context)
            elif node["type"] == "condition":
                output_data = await self._execute_condition_node(node, context)
            elif node["type"] == "mcp_tool":
                output_data = await self._execute_mcp_tool_node(node, context)
            elif node["type"] == "function":
                output_data = await self._execute_function_node(node, context)
            elif node["type"] == "end":
                output_data = await self._execute_end_node(node, context)
            else:
                raise ValueError(f"Unknown node type: {node['type']}")
            
            node_execution.output_data = output_data
            node_execution.status = WorkflowStatus.COMPLETED
            
        except Exception as e:
            logger.error(f"Node execution failed: {e}")
            node_execution.error_message = str(e)
            node_execution.status = WorkflowStatus.FAILED
            
        finally:
            execution_time = int((time.time() - start_time) * 1000)
            node_execution.execution_time_ms = execution_time
            node_execution.completed_at = datetime.utcnow()
            
        await self.db.commit()
        await self.db.refresh(node_execution)
        
        return node_execution
    
    async def _execute_start_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute start node."""
        return {"status": "started", "timestamp": datetime.utcnow().isoformat()}
    
    async def _execute_ai_chat_node(
        self, node: Dict[str, Any], context: Dict[str, Any], execution: WorkflowExecution
    ) -> Dict[str, Any]:
        """Execute AI chat node with LLM interaction."""
        
        config = node.get("config", {})
        
        # Prepare prompt with context variables
        prompt_template = config.get("prompt", "")
        prompt = self._render_template(prompt_template, context)
        
        # Get model configuration
        model_config = config.get("model", {})
        
        # Execute AI chat (this would integrate with your LLM service)
        # For now, return a placeholder response
        response = {
            "response": f"AI response to: {prompt}",
            "model": model_config.get("name", "default"),
            "tokens_used": 100,
            "cost": "0.01"
        }
        
        return response
    
    async def _execute_knowledge_retrieval_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute knowledge retrieval node using RAG."""
        
        config = node.get("config", {})
        query = self._render_template(config.get("query", ""), context)
        
        # Use RAG service to retrieve relevant context
        # This would need the application_id from the workflow context
        application_id = context.get("application_id")
        if not application_id:
            raise ValueError("Application ID required for knowledge retrieval")
        
        results = await self.rag_service.retrieve_relevant_context(
            application_id=UUID(application_id),
            query=query,
            limit=config.get("limit", 5),
            similarity_threshold=config.get("similarity_threshold", 0.7)
        )
        
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    
    async def _execute_condition_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute condition node for flow control."""
        
        config = node.get("config", {})
        condition = config.get("condition", "")
        
        # Simple condition evaluation with safe operations
        try:
            # Create a safe evaluation environment with limited builtins
            safe_dict = {
                "__builtins__": {
                    "len": len,
                    "str": str,
                    "int": int,
                    "float": float,
                    "bool": bool,
                    "max": max,
                    "min": min,
                    "abs": abs,
                    "round": round,
                },
                # Add context variables
                **context
            }
            
            # Basic condition evaluation (simple comparisons and logic)
            result = eval(condition, safe_dict)
            return {"condition_result": bool(result), "condition": condition}
        except Exception as e:
            logger.error(f"Condition evaluation failed: {e}")
            return {"condition_result": False, "error": str(e)}
    
    async def _execute_mcp_tool_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute MCP tool node."""
        
        config = node.get("config", {})
        tool_name = config.get("tool_name")
        server_name = config.get("server_name")
        tool_args = config.get("args", {})
        
        # Render arguments with context
        rendered_args = self._render_dict(tool_args, context)
        
        # Execute MCP tool
        result = await self.mcp_service.call_tool(
            server_name=server_name,
            tool_name=tool_name,
            arguments=rendered_args
        )
        
        return {
            "tool_name": tool_name,
            "server_name": server_name,
            "arguments": rendered_args,
            "result": result
        }
    
    async def _execute_function_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute custom function node."""
        
        config = node.get("config", {})
        function_code = config.get("function_code", "")
        
        # Execute custom function (with security considerations)
        # This is a simplified implementation with safety restrictions
        try:
            # Create a safe execution environment
            safe_globals = {
                "__builtins__": {
                    "len": len,
                    "str": str,
                    "int": int,
                    "float": float,
                    "bool": bool,
                    "list": list,
                    "dict": dict,
                    "max": max,
                    "min": min,
                    "abs": abs,
                    "round": round,
                    "sum": sum,
                    "range": range,
                    "enumerate": enumerate,
                    "zip": zip,
                }
            }
            
            # Create local variables with context
            local_vars = context.copy()
            
            # Execute the function code in restricted environment
            exec(function_code, safe_globals, local_vars)
            
            # Return the output from the function
            output = local_vars.get("output", {})
            return {"function_output": output}
            
        except Exception as e:
            logger.error(f"Function execution failed: {e}")
            return {"error": str(e), "function_output": {}}
    
    async def _execute_end_node(
        self, node: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute end node."""
        return {"status": "completed", "timestamp": datetime.utcnow().isoformat()}
    
    async def _get_next_node(
        self, 
        current_node_id: str, 
        edges: List[Dict[str, Any]], 
        context: Dict[str, Any]
    ) -> Optional[str]:
        """Get the next node to execute based on edges and conditions."""
        
        for edge in edges:
            if edge["source"] == current_node_id:
                # Check edge condition if exists
                condition = edge.get("condition")
                if condition:
                    try:
                        # Create a safe evaluation environment
                        safe_dict = {
                            "__builtins__": {
                                "len": len,
                                "str": str,
                                "int": int,
                                "float": float,
                                "bool": bool,
                                "max": max,
                                "min": min,
                                "abs": abs,
                                "round": round,
                            },
                            **context
                        }
                        if not eval(condition, safe_dict):
                            continue
                    except Exception as e:
                        logger.error(f"Edge condition evaluation failed: {e}")
                        continue
                
                return edge["target"]
        
        return None
    
    def _render_template(self, template: str, context: Dict[str, Any]) -> str:
        """Render template string with context variables."""
        try:
            # Simple template rendering (could use Jinja2 for more features)
            for key, value in context.items():
                template = template.replace(f"{{{{{key}}}}}", str(value))
            return template
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return template
    
    def _render_dict(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Render dictionary values with context variables."""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self._render_template(value, context)
            elif isinstance(value, dict):
                result[key] = self._render_dict(value, context)
            else:
                result[key] = value
        return result
    
    async def _get_workflow(self, workflow_id: UUID) -> Optional[Workflow]:
        """Get workflow by ID with all related data."""
        stmt = select(Workflow).where(Workflow.id == workflow_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_execution_status(self, execution_id: UUID) -> Optional[WorkflowExecution]:
        """Get workflow execution status."""
        stmt = (
            select(WorkflowExecution)
            .options(selectinload(WorkflowExecution.node_executions))
            .where(WorkflowExecution.id == execution_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def pause_execution(self, execution_id: UUID) -> bool:
        """Pause workflow execution."""
        stmt = (
            update(WorkflowExecution)
            .where(WorkflowExecution.id == execution_id)
            .values(status=WorkflowStatus.PAUSED)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
    
    async def resume_execution(self, execution_id: UUID) -> bool:
        """Resume paused workflow execution."""
        execution = await self.get_execution_status(execution_id)
        if not execution or execution.status != WorkflowStatus.PAUSED:
            return False
        
        execution.status = WorkflowStatus.ACTIVE
        await self.db.commit()
        
        # Continue execution from where it left off
        workflow = await self._get_workflow(execution.workflow_id)
        await self._execute_workflow_nodes(execution, workflow)
        
        return True 