# Configuration Directory Documentation

## Overview

This directory contains the server configuration and metadata for the MCP server. It centralizes all configuration-related code to make it easy to modify server behavior and capabilities.

## Files

### `server-config.ts`

The main configuration file that exports:

- `serverConfig`: Server metadata and settings
- `serverCapabilities`: Server capability definitions

## Configuration Structure

### Server Configuration

```typescript
{
  name: string;           // "systemprompt-agent-server"
  version: string;        // Current server version
  metadata: {
    name: string;         // "System Prompt Agent Server"
    description: string;  // Server description
    icon: string;         // "solar:align-horizontal-center-line-duotone"
    color: string;        // "primary"
    serverStartTime: number;  // Server start timestamp
    environment: string;  // process.env.NODE_ENV
    customData: {
      serverFeatures: string[];  // ["agent", "prompts", "systemprompt"]
    }
  }
}
```

### Server Capabilities

```typescript
{
  capabilities: {
    resources: {
      listChanged: true,  // Support for resource change notifications
    },
    tools: {},           // Tool-specific capabilities
    prompts: {
      listChanged: true, // Support for prompt change notifications
    }
  }
}
```

## Usage

Import the configuration objects from this directory when setting up the MCP server:

```typescript
import { serverConfig, serverCapabilities } from "./config/server-config.js";
```

## Environment Variables

The server uses the following environment variables:

- `NODE_ENV`: Determines the runtime environment (development/production)

## Feature Flags

The server supports the following features through `serverFeatures`:

- `agent`: Agent management capabilities
- `prompts`: Prompt creation and management
- `systemprompt`: Integration with systemprompt.io

## Capabilities

The server implements these MCP capabilities:

- **Resources**: Supports change notifications for resource updates
- **Prompts**: Supports change notifications for prompt updates
- **Tools**: Extensible tool system (configuration determined at runtime)
