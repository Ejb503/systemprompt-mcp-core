# Services Directory Documentation

## Overview

This directory contains service implementations that handle external integrations and business logic for the MCP server, primarily focusing on interactions with the systemprompt.io API.

## Service Files

### `systemprompt-service.ts`

A singleton service for interacting with the systemprompt.io API:

```typescript
class SystemPromptService {
  private static instance: SystemPromptService | null = null;

  static initialize(apiKey: string, baseUrl?: string): void;
  static getInstance(): SystemPromptService;

  // Prompt Operations
  async getAllPrompts(): Promise<SystempromptPromptResponse[]>;
  async createPrompt(
    data: SystempromptPromptRequest
  ): Promise<SystempromptPromptResponse>;
  async editPrompt(
    uuid: string,
    data: Partial<SystempromptPromptRequest>
  ): Promise<SystempromptPromptResponse>;
  async deletePrompt(uuid: string): Promise<void>;

  // Block Operations
  async listBlocks(): Promise<SystempromptBlockResponse[]>;
  async getBlock(blockId: string): Promise<SystempromptBlockResponse>;
  async createBlock(
    data: SystempromptBlockRequest
  ): Promise<SystempromptBlockResponse>;
  async editBlock(
    uuid: string,
    data: Partial<SystempromptBlockRequest>
  ): Promise<SystempromptBlockResponse>;
  async deleteBlock(uuid: string): Promise<void>;
}
```

#### Features

- Singleton pattern with API key initialization
- Full CRUD operations for prompts and blocks
- Type-safe request/response handling
- Comprehensive error handling
- Configurable API endpoint

## Implementation Details

### Initialization

```typescript
// Initialize with API key
SystemPromptService.initialize("your-api-key");

// Get instance for use
const service = SystemPromptService.getInstance();
```

### API Integration

- RESTful API communication using `fetch`
- Base URL: `https://api.systemprompt.io/v1`
- Authentication via API key header
- JSON request/response handling
- Proper error status handling

### Error Handling

The service implements comprehensive error handling:

```typescript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Invalid API key");
    }
    throw new Error(responseData.message || "API request failed");
  }
} catch (error) {
  // Proper error propagation with context
  throw new Error(`API request failed: ${error.message}`);
}
```

### Type Safety

- All operations use TypeScript interfaces
- Request/response types defined in `types/index.ts`
- Strict null checks and error handling
- Type-safe partial updates

## Usage Examples

### Managing Prompts

```typescript
const service = SystemPromptService.getInstance();

// Create a prompt
const prompt = await service.createPrompt({
  metadata: {
    title: "Example Prompt",
    description: "A sample prompt",
  },
  instruction: {
    static: "Static instruction",
    dynamic: "Dynamic part",
    state: "",
  },
});

// Edit a prompt
await service.editPrompt(prompt.id, {
  metadata: {
    title: "Updated Title",
  },
});
```

### Managing Blocks

```typescript
// Create a block
const block = await service.createBlock({
  content: "Block content",
  prefix: "test",
  metadata: {
    title: "Example Block",
    description: "A sample block",
  },
});

// List all blocks
const blocks = await service.listBlocks();
```
