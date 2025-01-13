# systemprompt-agent-server

[![npm version](https://img.shields.io/npm/v/systemprompt-agent-server.svg)](https://www.npmjs.com/package/systemprompt-agent-server)
[![smithery badge](https://smithery.ai/badge/systemprompt-agent-server)](https://smithery.ai/server/systemprompt-agent-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/tyingshoelaces_?style=social)](https://twitter.com/tyingshoelaces_)
[![Discord](https://img.shields.io/discord/1255160891062620252?color=7289da&label=discord)](https://discord.com/invite/wkAbSuPWpr)

[Website](https://systemprompt.io) | [Documentation](https://systemprompt.io/documentation) | [Blog](https://tyingshoelaces.com) | [Get API Key](https://systemprompt.io/console)

A specialized Model Context Protocol (MCP) server that enables you to create, manage, and extend AI agents through a powerful prompt and tool management system. This server integrates with [systemprompt.io](https://systemprompt.io) to provide seamless creation, management, and versioning of system prompts through MCP. It works in conjunction with the [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) to provide a complete voice-powered AI workflow solution.

An API KEY is required to use this server. This is currently free, although this may change in the future. You can get one [here](https://systemprompt.io/console).

## Required Client

This server is designed to work with the [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) - a voice-powered MCP client that provides the frontend interface. Please make sure to set up both components for the full functionality.

## Why Use This Server?

- **Agent Management**: Create and manage AI agents with customized system prompts and tool configurations
- **Extensible Tool System**: Add, modify, and combine tools to enhance your agents' capabilities through MCP
- **Prompt Management**: Centralized management of system prompts with versioning and metadata support
- **Type-Safe Integration**: Full TypeScript support with proper error handling
- **MCP Compatibility**: Works seamlessly with [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) and other MCP-compatible clients
- **Open Source**: Free to use and modify under the MIT license

## Features

### Agent Management

- Create and configure AI agents with specific capabilities
- Manage agent states and contexts
- Define agent behaviors through system prompts
- Monitor and debug agent interactions

### Tools

- Extend agent capabilities with custom tools
- Built-in tools include:

  - `create_prompt` - Create new system prompts with metadata
  - `edit_prompt` - Update existing system prompts with versioning
  - `create_resource` - Create new agent resources and configurations
  - `edit_resource` - Modify existing agent resources
  - `list_resources` - Browse available agent resources
  - `read_resource` - Access specific agent resource content

- Add your own tools through the MCP interface

### Prompts

- Create and version system prompts
- Manage prompt templates
- Access structured prompts for various use cases

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

### Installing via Smithery

To install SystemPrompt Agent for Claude Desktop automatically via [Smithery](https://smithery.ai/server/systemprompt-agent-server):

```bash
npx -y @smithery/cli install systemprompt-agent-server --client claude
```

### Manual Installation

To manually configure with Claude Desktop, add the server config:

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

### Test Utilities

The project provides a comprehensive set of test utilities in `src/__tests__/test-utils.ts`:

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
