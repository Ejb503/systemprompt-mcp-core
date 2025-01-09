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
  name: string;           // Server name identifier
  version: string;        // Server version
  metadata: {
    name: string;         // Display name
    description: string;  // Server description
    icon: string;         // UI icon identifier
    color: string;        // UI theme color
    serverStartTime: number;  // Server start timestamp
    environment: string;  // Runtime environment
    customData: {
      serverFeatures: string[];  // Enabled features
    }
  }
}
```

### Server Capabilities

```typescript
{
  capabilities: {
    resources: {
    } // Resource handling capabilities
    tools: {
    } // Tool handling capabilities
    prompts: {
    } // Prompt handling capabilities
  }
}
```

## Usage

Import the configuration objects from this directory when setting up the MCP server:

```typescript
import { serverConfig, serverCapabilities } from "./config/server-config.js";
```
