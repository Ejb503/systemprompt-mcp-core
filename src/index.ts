#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequest,
  ListToolsRequest,
  CallToolRequest,
  ReadResourceRequest,
  ListPromptsRequest,
  GetPromptRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { handleListTools, handleToolCall } from "./handlers/tool-handlers.js";
import {
  handleListResources,
  handleResourceCall,
} from "./handlers/resource-handlers.js";
import {
  handleListPrompts,
  handleGetPrompt,
} from "./handlers/prompt-handlers.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";
import { SystemPromptService } from "./services/systemprompt-service.js";

export async function startServer(apiKey: string) {
  if (!apiKey) {
    console.error(
      "API key is required. Usage: systemprompt-agent-server <API_KEY>"
    );
    process.exit(1);
  }

  try {
    SystemPromptService.initialize(apiKey);
  } catch (error) {
    console.error("Failed to initialize service:", error);
    process.exit(1);
  }

  const server = new Server(serverConfig, serverCapabilities);

  server.setRequestHandler(
    ListResourcesRequestSchema,
    (req: ListResourcesRequest) => handleListResources(req)
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    (req: ReadResourceRequest) => handleResourceCall(req)
  );

  server.setRequestHandler(ListToolsRequestSchema, (req: ListToolsRequest) =>
    handleListTools(req)
  );

  server.setRequestHandler(CallToolRequestSchema, (req: CallToolRequest) =>
    handleToolCall(req)
  );

  server.setRequestHandler(
    ListPromptsRequestSchema,
    (req: ListPromptsRequest) => handleListPrompts(req)
  );

  server.setRequestHandler(GetPromptRequestSchema, (req: GetPromptRequest) =>
    handleGetPrompt(req)
  );

  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    return transport;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error(
      "API key is required. Usage: systemprompt-agent-server <API_KEY>"
    );
    process.exit(1);
  }
  startServer(apiKey).catch((error: Error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
