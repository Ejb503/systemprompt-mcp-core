# Services Directory Documentation

## Overview

This directory contains service implementations that handle external integrations and business logic for the MCP server.

## Service Files

### `systemprompt-service.ts`

Service for interacting with the systemprompt.io API:

```typescript
class SystemPromptService {
  constructor(apiBaseUrl: string = "https://systemprompt.io/api");
  async createPrompt(input: CreatePromptInput): Promise<PromptCreationResult>;
  async getPrompt(promptId: string): Promise<string>;
}
```

#### Features

- Creates new systemprompt compatible prompts
- Retrieves existing prompts by ID
- Handles API communication and error cases
- Provides type-safe interfaces

### `docs-service.ts`

Service for managing documentation resources:

- Handles resource retrieval and management
- Provides access to Swagger and API documentation
- Manages agent documentation

## Implementation Standards

### API Integration

- RESTful API communication using `fetch`
- JSON request/response handling
- Proper error handling and status checks
- Configurable API base URL

### Error Handling

```typescript
try {
  // API calls with proper error handling
} catch (error) {
  throw new Error(
    `Error message: ${error instanceof Error ? error.message : "Unknown error"}`
  );
}
```

### Type Safety

- All service methods are properly typed
- Input/output interfaces are defined in `types/`
- Error types are properly handled

## Usage Example

```typescript
const service = new SystemPromptService();
const result = await service.createPrompt({
  title: "Example Prompt",
  description: "A sample prompt",
});
```
