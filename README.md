# systemprompt-agent-server

[![npm version](https://img.shields.io/npm/v/systemprompt-mcp-interview.svg)](https://www.npmjs.com/package/systemprompt-mcp-core)
[![smithery badge](https://smithery.ai/badge/systemprompt-agent-server)](https://smithery.ai/server/systemprompt-agent-server)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter Follow](https://img.shields.io/twitter/follow/tyingshoelaces_?style=social)](https://twitter.com/tyingshoelaces_)
[![Discord](https://img.shields.io/discord/1255160891062620252?color=7289da&label=discord)](https://discord.com/invite/wkAbSuPWpr)

[Website](https://systemprompt.io) | [Documentation](https://systemprompt.io/documentation) | [Blog](https://tyingshoelaces.com) | [Get API Key](https://systemprompt.io/console)

A specialized Model Context Protocol (MCP) server that enables you to create, manage, and extend AI agents through a powerful prompt and tool management system. This server integrates with [systemprompt.io](https://systemprompt.io) to provide seamless creation, management, and versioning of system prompts through MCP.

An API KEY is required to use this server. This is currently free, although this may change in the future. You can get one [here](https://systemprompt.io/console).

This server uses Sampling and Notification functionality from the [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk). This will only work with advanced clients that support these features. A free opensource client [multimodal-mcp-client](https://github.com/Ejb503/multimodal-mcp-client) can be used to provide a complete voice-powered AI workflow solution.

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

#### Core Functionality

- **MCP Protocol Integration**: Full implementation of Model Context Protocol for seamless AI agent interactions
- **Voice-Powered Interface**: Compatible with voice commands through multimodal-mcp-client
- **Real-Time Processing**: Supports streaming responses and real-time interactions
- **Type-Safe Implementation**: Full TypeScript support with proper error handling

#### Agent Management

- Create and configure AI agents with specific capabilities
- Manage agent states and contexts
- Define agent behaviors through system prompts
- Monitor and debug agent interactions
- Version control for agent configurations
- Resource management for agent assets

#### Advanced Tools System

Built-in tools include:

- **Prompt Management**
  - `create_prompt` - Create new system prompts with metadata
  - `edit_prompt` - Update existing system prompts with versioning
  - `get_prompt` - Retrieve specific prompt configurations
- **Resource Management**
  - `create_resource` - Create new agent resources and configurations
  - `edit_resource` - Modify existing agent resources
  - `list_resources` - Browse available agent resources
  - `read_resource` - Access specific agent resource content
- **System Tools**
  - `systemprompt_heartbeat` - Monitor system status and health
  - `systemprompt_fetch_resources` - Retrieve all available resources
- **Agent Management**
  - `create_agent` - Create new systemprompt agents
  - `edit_agent` - Modify existing systemprompt agents
  - `list_agents` - View available systemprompt agents

#### Sampling & Notifications

- Advanced sampling capabilities for AI responses
- Real-time notification system for agent events
- Configurable sampling parameters
- Event-driven architecture for notifications

#### Integration Features

- API Key management and authentication
- User status and billing information tracking
- Subscription management
- Usage monitoring and analytics

#### Development Tools

- Built-in debugging capabilities
- Test utilities and fixtures
- Type-safe mocking utilities
- Comprehensive testing framework

## 🎥 Demo & Showcase

Watch our video demonstration to see Systemprompt MCP Client in action:

[▶️ Watch Demo Video](https://www.youtube.com/watch?v=n94JtRXXqec)

The demo showcases:

- Voice-controlled AI interactions
- Multimodal input processing
- Tool execution and workflow automation
- Real-time voice synthesis

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

## Related Links

- [Multimodal MCP Client](https://github.com/Ejb503/multimodal-mcp-client) - Voice-powered MCP client
- [systemprompt.io Documentation](https://systemprompt.io/docs)
