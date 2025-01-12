# systemprompt-agent-server

A specialized Model Context Protocol (MCP) server that integrates with [systemprompt.io](https://systemprompt.io) to provide powerful prompt management capabilities. This server enables seamless creation, management, and versioning of system prompts through MCP. It works in conjunction with the [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) to provide a complete voice-powered AI workflow solution.

## Why Use This Server?

- **Centralized Prompt Management**: Manage all your system prompts in one place with versioning and metadata support
- **Type-Safe Integration**: Full TypeScript support for systemprompt.io's API with proper error handling
- **MCP Compatibility**: Works seamlessly with [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) and other MCP-compatible clients like Claude Desktop
- **Standardized Format**: Ensures your prompts follow systemprompt.io's proven format and best practices

## Features

### Resources

- List and access notes via `note://` URIs
- Each note has a title, content and metadata
- Plain text mime type for simple content access

### Tools

#### `create_prompt`

Create a new prompt with customizable instruction components, input/output schemas, and metadata. The instruction can contain static content (always included), state content (persisted between calls), and dynamic content (provided at runtime). Input and output schemas define the expected format and type of data. Use this to create reusable prompt templates that can be executed later.

The prompt contains the following fields:

- `instruction`: The main instruction for the prompt, which can include static content, state content, and dynamic content.
- `input_schema`: The expected input format and type of data for the prompt.
- `output_schema`: The expected output format and type of data for the prompt.
- `metadata`: Additional metadata for the prompt, such as tags or categories.

#### `edit_prompt`

Modify an existing prompt template by its UUID. You can update any combination of the instruction components, input/output schemas, or metadata. Only the specified fields will be updated, leaving others unchanged. This is useful for iterating on prompt designs or fixing issues in existing prompts.

The prompt contains the following fields:

- `uuid`: The UUID of the prompt to edit.
- `instruction`: The main instruction for the prompt, which can include static content, state content, and dynamic content.
- `input_schema`: The expected input format and type of data for the prompt.
- `output_schema`: The expected output format and type of data for the prompt.
- `metadata`: Additional metadata for the prompt, such as tags or categories.

#### `create_block`

Create a new block (resource) that can be referenced by prompts. Blocks are reusable content snippets that can be included in multiple prompts, such as common instructions, context, or constraints. Each block has a unique prefix for easy referencing in prompts using the {{prefix}} syntax.

The block contains the following fields:

- `content`: The content of the block, which can include static text, state content, and dynamic content.
- `prefix`: The unique prefix for the block, used in prompts to reference the block content.
- `metadata`: Additional metadata for the block, such as tags or categories.

#### `edit_block`

Modify an existing block (resource) by its UUID. You can update the content, prefix, or metadata of the block. Only the specified fields will be updated, leaving others unchanged. This is useful for maintaining and improving shared prompt components.

The block contains the following fields:

- `uuid`: The UUID of the block to edit.
- `content`: The content of the block, which can include static text, state content, and dynamic content.
- `prefix`: The unique prefix for the block, used in prompts to reference the block content.
- `metadata`: Additional metadata for the block, such as tags or categories.

### Prompts

- `summarize_notes` - Generate a summary of all stored notes
  - Includes all note contents as embedded resources
  - Returns structured prompt for LLM summarization

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "systemprompt-agent-server": {
      "command": "/path/to/systemprompt-agent-server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Testing

This project uses Jest for testing with TypeScript and ESM (ECMAScript Modules) support.

### Test Configuration

The test setup includes:

- Full TypeScript support with ESM modules
- Global fetch mocking
- Automatic test reset between runs
- Custom matchers for validation
- Type-safe mocking utilities

#### Module Resolution

The project uses a dual module resolution strategy:

- Source code uses ESM (ECMAScript Modules) with `.js` extensions
- Tests use CommonJS for compatibility with Jest

This is configured through two TypeScript configurations:

- `tsconfig.json`: Main configuration for source code (ESM)
- `tsconfig.test.json`: Test-specific configuration (CommonJS)

```typescript
// Source code imports (ESM)
import { Something } from "../path/to/module.js";

// Test file imports (CommonJS)
import { Something } from "../path/to/module";
```

### Running Tests

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

Tests are located in `__tests__` directories next to the files they test. The naming convention is `*.test.ts`.

### Mocking Patterns

#### Service Mocks

When mocking services with ESM, follow this pattern:

```typescript
// 1. Import types first
import type { MyType } from "@/types/index.js";

// 2. Declare mock functions with proper types
const mockMethod = jest.fn<(arg: string) => Promise<MyType>>();

// 3. Set up the mock before imports that use it
jest.mock("@/services/my-service.js", () => ({
  MyService: jest.fn(() => ({
    method: mockMethod,
  })),
}));

// 4. Import the actual modules after mocking
import { handler } from "../handler.js";
import { MyService } from "@/services/my-service.js";

describe("Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle success case", async () => {
    mockMethod.mockResolvedValueOnce({ id: "123" });
    const result = await handler();
    expect(result).toBeDefined();
  });
});
```

#### HTTP Mocks

The project provides type-safe HTTP mocking utilities:

```typescript
// Mock successful responses
mockFetchResponse(data, {
  status: 201,
  statusText: "Created",
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock error responses
mockFetchResponse(errorData, {
  ok: false,
  status: 400,
  statusText: "Bad Request",
});

// Mock network errors
mockFetchError("Network failure");
```

### Test Utilities

The project provides a comprehensive set of test utilities in `src/__test__/test-utils.ts`:

```typescript
// Create test fixtures
const note = TestFixtures.createNote({ title: "Custom Note" });
const noteList = TestFixtures.createNoteList(3); // Creates 3 test notes

// Type-safe partial mocks
const mockService = createPartialMock<SystemPromptService>({
  getNotes: jest.fn().mockResolvedValue([]),
});

// Async utilities
await flushPromises(); // Wait for all promises to resolve
```

### Best Practices

1. Always provide proper types for prompt inputs and outputs
2. Include comprehensive metadata for better prompt management
3. Use the built-in validation before creating prompts
4. Follow the systemprompt.io format guidelines

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

## Related Links

- [Multimodal MCP Client](https://github.com/Ejb503/multimodal-mcp-client) - Voice-powered MCP client
- [systemprompt.io Documentation](https://systemprompt.io/docs)
- [Model Context Protocol Specification](https://github.com/anthropics/anthropic-tools/tree/main/model-context-protocol)
- [Claude Desktop](https://claude.ai/desktop)
