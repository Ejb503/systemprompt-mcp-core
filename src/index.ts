#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleListTools, handleToolCall } from "./handlers/tool-handlers.js";
import {
  handleListResources,
  handleResourceCall,
} from "./handlers/resource-handlers.js";
import { BlockService } from "./services/block-service.js";

const API_KEY = process.env.API_KEY || '';
const blockService = new BlockService(API_KEY);

const server = new Server(
  { name: "systemprompt-agent", version: "1.0.0" },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Set up resource handlers
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, handleListTools);
server.setRequestHandler(CallToolRequestSchema, handleToolCall);

const transport = new StdioServerTransport();
server.connect(transport).catch((error: Error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export {
  // Tool handlers
  handleListTools,
  handleToolCall,

  // Resource handlers
  handleListResources,
  handleResourceCall,
};
