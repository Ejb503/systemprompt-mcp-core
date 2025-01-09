# Handlers Directory Documentation

## Overview

This directory contains the MCP server request handlers that implement the core functionality for resources, tools, and prompts.

## Handler Files

### `resource-handlers.ts`

Implements handlers for accessing documentation resources:

- `handleListResources()`: Lists available documentation resources
- `handleReadResource()`: Retrieves specific resource content

### `tool-handlers.ts`

Implements handlers for prompt creation tools:

- `handleListTools()`: Lists available tools (currently `create_systemprompt`)
- `handleToolCall()`: Handles tool execution requests

### `prompt-handlers.ts`

Implements handlers for prompt templates:

- `handleListPrompts()`: Lists available prompt templates
- `handleGetPrompt()`: Retrieves specific prompt template

## Implementation Details

### Resource Handlers

- Resources are stored in memory with URI scheme `resource:///`
- Supports Swagger docs, API docs, and agent documentation
- Returns content with `text/plain` MIME type

### Tool Handlers

- Implements prompt creation tool with title/description inputs
- Validates input parameters
- Integrates with SystemPromptService for prompt creation
- Returns creation results with prompt ID and content

### Prompt Handlers

- Provides template for creating systemprompt compatible prompts
- Implements conversation-style prompt template
- Returns structured messages for prompt creation guidance

## Error Handling

- All handlers include proper error handling
- Invalid requests return descriptive error messages
- Resource not found errors are properly handled
- Input validation errors include specific failure reasons

## Usage Example

```typescript
// Register handlers with MCP server
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleReadResource);
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
// ... etc
```
