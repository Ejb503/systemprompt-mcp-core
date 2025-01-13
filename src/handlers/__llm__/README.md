# Handlers Directory Documentation

## Overview

This directory contains the MCP server request handlers that implement the core functionality for resources, tools, and prompts. These handlers integrate with the systemprompt.io API to provide prompt and resource management capabilities.

## Handler Files

### `resource-handlers.ts`

Implements handlers for managing systemprompt.io blocks (resources):

- `handleListResources()`: Lists available blocks with metadata
- `handleResourceCall()`: Retrieves block content by URI (`resource:///block/{id}`)

### `tool-handlers.ts`

Implements handlers for prompt and resource management tools:

- `handleListTools()`: Lists available tools
- `handleToolCall()`: Executes tool operations:
  - `systemprompt_create_prompt`: Create new prompts
  - `systemprompt_edit_prompt`: Update existing prompts
  - `systemprompt_delete_prompt`: Remove prompts
  - `systemprompt_create_resource`: Create new blocks
  - `systemprompt_edit_resource`: Update existing blocks
  - `systemprompt_delete_resource`: Remove blocks
  - `systemprompt_fetch_resource`: Retrieve block content

### `prompt-handlers.ts`

Implements handlers for prompt management:

- `handleListPrompts()`: Lists available prompts with metadata
- `handleGetPrompt()`: Retrieves specific prompt by name

## Implementation Details

### Resource Handlers

- Resources are stored as blocks in systemprompt.io
- URI scheme: `resource:///block/{id}`
- Supports metadata and content management
- Returns content with proper MCP formatting

### Tool Handlers

- Implements full CRUD operations for prompts and resources
- Validates input parameters against schemas
- Integrates with SystemPromptService for API operations
- Sends change notifications after successful operations
- Handles asynchronous operations with proper error handling

### Prompt Handlers

- Manages systemprompt.io compatible prompts
- Supports static and dynamic instructions
- Maps API responses to MCP format
- Includes metadata and versioning support

## Error Handling

- All handlers include comprehensive error handling
- Invalid requests return descriptive error messages
- API errors are properly caught and formatted
- Resource not found errors include specific details
- Change notifications handle failures gracefully

## Usage Example

```typescript
// Register handlers with MCP server
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleToolCall);
server.setRequestHandler(ListPromptsRequestSchema, handleListPrompts);
server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);
```

## Notifications

The server implements change notifications for:

- Prompt updates (`sendPromptChangedNotification`)
- Resource updates (`sendResourceChangedNotification`)

These are sent asynchronously after successful operations to maintain responsiveness.
