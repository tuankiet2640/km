"""
MCP (Model Context Protocol) Client Service for AI Knowledge Platform.
Handles external tool integrations and service connectivity.
"""

import asyncio
import json
import httpx
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.mcp import (
    MCPServer, MCPToolCall, MCPServerStatus, MCPTransportType
)
from app.core.config import settings
from app.core.database import get_db

import logging

logger = logging.getLogger(__name__)


class MCPClientService:
    """Service for managing MCP server connections and tool calls."""
    
    def __init__(self):
        self.active_connections: Dict[str, Any] = {}
        self.client = httpx.AsyncClient(timeout=settings.MCP_TIMEOUT)
    
    async def register_server(
        self,
        name: str,
        url: str,
        transport: MCPTransportType = MCPTransportType.SSE,
        timeout: int = 180,
        auth_config: Optional[Dict[str, Any]] = None,
        created_by_id: Optional[UUID] = None
    ) -> MCPServer:
        """Register a new MCP server."""
        
        async with get_db() as db:
            # Check if server already exists
            stmt = select(MCPServer).where(MCPServer.name == name)
            existing_server = await db.execute(stmt)
            if existing_server.scalar_one_or_none():
                raise ValueError(f"MCP server '{name}' already exists")
            
            # Create new server
            server = MCPServer(
                name=name,
                url=url,
                transport=transport,
                timeout=timeout,
                auth_config=auth_config or {},
                created_by_id=created_by_id
            )
            
            db.add(server)
            await db.commit()
            await db.refresh(server)
            
            # Test connection and get capabilities
            try:
                capabilities = await self._test_connection(server)
                server.capabilities = capabilities
                server.status = MCPServerStatus.ACTIVE
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to connect to MCP server {name}: {e}")
                server.status = MCPServerStatus.ERROR
                await db.commit()
            
            return server
    
    async def call_tool(
        self,
        server_name: str,
        tool_name: str,
        arguments: Dict[str, Any],
        chat_id: Optional[UUID] = None,
        message_id: Optional[UUID] = None,
        workflow_execution_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Call a tool on an MCP server."""
        
        async with get_db() as db:
            # Get server configuration
            server = await self._get_server_by_name(db, server_name)
            if not server:
                raise ValueError(f"MCP server '{server_name}' not found")
            
            if server.status != MCPServerStatus.ACTIVE:
                raise RuntimeError(f"MCP server '{server_name}' is not active")
            
            # Create tool call record
            tool_call = MCPToolCall(
                mcp_server_id=server.id,
                tool_name=tool_name,
                input_data=arguments,
                chat_id=chat_id,
                message_id=message_id,
                workflow_execution_id=workflow_execution_id
            )
            
            db.add(tool_call)
            await db.commit()
            await db.refresh(tool_call)
            
            start_time = time.time()
            
            try:
                # Execute tool call based on transport type
                if server.transport == MCPTransportType.SSE:
                    result = await self._call_tool_sse(server, tool_name, arguments)
                elif server.transport == MCPTransportType.HTTP:
                    result = await self._call_tool_http(server, tool_name, arguments)
                elif server.transport == MCPTransportType.WEBSOCKET:
                    result = await self._call_tool_websocket(server, tool_name, arguments)
                else:
                    raise ValueError(f"Unsupported transport type: {server.transport}")
                
                # Update tool call with results
                tool_call.output_data = result
                tool_call.status = "success"
                tool_call.completed_at = datetime.utcnow()
                
                # Update server statistics
                server.successful_requests += 1
                server.last_used = datetime.utcnow()
                
            except Exception as e:
                logger.error(f"MCP tool call failed: {e}")
                tool_call.error_message = str(e)
                tool_call.status = "error"
                tool_call.completed_at = datetime.utcnow()
                
                # Update server statistics
                server.failed_requests += 1
                
                raise
            
            finally:
                execution_time = int((time.time() - start_time) * 1000)
                tool_call.execution_time_ms = execution_time
                server.total_requests += 1
                
                await db.commit()
            
            return tool_call.output_data
    
    async def _call_tool_sse(
        self, 
        server: MCPServer, 
        tool_name: str, 
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call tool using SSE transport."""
        
        payload = {
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }
        
        headers = {"Content-Type": "application/json"}
        
        # Add authentication headers if configured
        if server.auth_config:
            headers.update(self._get_auth_headers(server.auth_config))
        
        response = await self.client.post(
            server.url,
            json=payload,
            headers=headers,
            timeout=server.timeout
        )
        
        response.raise_for_status()
        return response.json()
    
    async def _call_tool_http(
        self, 
        server: MCPServer, 
        tool_name: str, 
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call tool using HTTP transport."""
        
        payload = {
            "tool": tool_name,
            "arguments": arguments
        }
        
        headers = {"Content-Type": "application/json"}
        
        # Add authentication headers if configured
        if server.auth_config:
            headers.update(self._get_auth_headers(server.auth_config))
        
        response = await self.client.post(
            f"{server.url}/call_tool",
            json=payload,
            headers=headers,
            timeout=server.timeout
        )
        
        response.raise_for_status()
        return response.json()
    
    async def _call_tool_websocket(
        self, 
        server: MCPServer, 
        tool_name: str, 
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Call tool using WebSocket transport."""
        # WebSocket implementation would go here
        # For now, raise not implemented
        raise NotImplementedError("WebSocket transport not yet implemented")
    
    async def _test_connection(self, server: MCPServer) -> Dict[str, Any]:
        """Test connection to MCP server and get capabilities."""
        
        try:
            headers = {"Content-Type": "application/json"}
            
            # Add authentication headers if configured
            if server.auth_config:
                headers.update(self._get_auth_headers(server.auth_config))
            
            # Try to get server capabilities
            if server.transport == MCPTransportType.SSE:
                payload = {"method": "initialize", "params": {}}
                response = await self.client.post(
                    server.url,
                    json=payload,
                    headers=headers,
                    timeout=30
                )
            else:
                response = await self.client.get(
                    f"{server.url}/capabilities",
                    headers=headers,
                    timeout=30
                )
            
            response.raise_for_status()
            capabilities = response.json()
            
            # Extract available tools if present
            tools = capabilities.get("capabilities", {}).get("tools", {}).get("listChanged", [])
            server.available_tools = tools
            
            return capabilities
            
        except Exception as e:
            logger.error(f"MCP server connection test failed: {e}")
            raise
    
    def _get_auth_headers(self, auth_config: Dict[str, Any]) -> Dict[str, str]:
        """Generate authentication headers based on auth config."""
        
        headers = {}
        auth_type = auth_config.get("type", "")
        
        if auth_type == "bearer":
            token = auth_config.get("token", "")
            headers["Authorization"] = f"Bearer {token}"
        elif auth_type == "api_key":
            api_key = auth_config.get("api_key", "")
            key_header = auth_config.get("header", "X-API-Key")
            headers[key_header] = api_key
        elif auth_type == "basic":
            import base64
            username = auth_config.get("username", "")
            password = auth_config.get("password", "")
            credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
            headers["Authorization"] = f"Basic {credentials}"
        
        return headers
    
    async def _get_server_by_name(self, db: AsyncSession, name: str) -> Optional[MCPServer]:
        """Get an MCP server by its name."""
        stmt = select(MCPServer).where(MCPServer.name == name)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_servers(self, user_id: Optional[UUID] = None) -> List[MCPServer]:
        """List all registered MCP servers."""
        
        async with get_db() as db:
            stmt = select(MCPServer).order_by(MCPServer.name)
            result = await db.execute(stmt)
            return result.scalars().all()
    
    async def get_server_tools(self, server_name: str) -> List[Dict[str, Any]]:
        """Get available tools from a specific server."""
        
        async with get_db() as db:
            server = await self._get_server_by_name(db, server_name)
            if not server:
                raise ValueError(f"MCP server '{server_name}' not found")
            return server.capabilities.get("tools", [])
    
    async def health_check_server(self, server_name: str) -> bool:
        """Perform a health check on a server."""
        
        async with get_db() as db:
            server = await self._get_server_by_name(db, server_name)
            if not server:
                return False
            
            try:
                capabilities = await self._test_connection(server)
                server.capabilities = capabilities
                server.status = MCPServerStatus.ACTIVE
                server.last_health_check = datetime.utcnow()
                await db.commit()
                return True
            except Exception as e:
                logger.warning(f"Health check failed for {server_name}: {e}")
                server.status = MCPServerStatus.ERROR
                server.last_health_check = datetime.utcnow()
                await db.commit()
                return False
    
    async def update_server_config(
        self,
        server_name: str,
        config_updates: Dict[str, Any],
        user_id: Optional[UUID] = None
    ) -> MCPServer:
        """Update configuration for an MCP server."""
        
        async with get_db() as db:
            server = await self._get_server_by_name(db, server_name)
            if not server:
                raise ValueError(f"MCP server '{server_name}' not found")
            
            for key, value in config_updates.items():
                if hasattr(server, key):
                    setattr(server, key, value)
            
            server.updated_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(server)
            return server
    
    async def get_tool_call_history(
        self,
        server_name: Optional[str] = None,
        tool_name: Optional[str] = None,
        limit: int = 100
    ) -> List[MCPToolCall]:
        """Get the history of tool calls."""
        
        async with get_db() as db:
            stmt = select(MCPToolCall).order_by(MCPToolCall.created_at.desc()).limit(limit)
            
            if server_name:
                server = await self._get_server_by_name(db, server_name)
                if server:
                    stmt = stmt.where(MCPToolCall.mcp_server_id == server.id)
            
            if tool_name:
                stmt = stmt.where(MCPToolCall.tool_name == tool_name)
                
            result = await db.execute(stmt)
            return result.scalars().all()
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose() 