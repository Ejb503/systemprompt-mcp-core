import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";
import {
  handleListResources,
  handleResourceCall,
  initializeService as initializeResourceService,
} from "./handlers/resource-handlers.js";
import {
  handleListTools,
  handleToolCall,
  initializeService as initializeToolService,
} from "./handlers/tool-handlers.js";
import {
  handleListPrompts,
  handleGetPrompt,
  initializeService as initializePromptService,
} from "./handlers/prompt-handlers.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";

async function main() {
  try {
    // Load environment variables first
    config();

    const apiKey = process.env.SYSTEMPROMPT_API_KEY;
    if (!apiKey) {
      throw new Error("SYSTEMPROMPT_API_KEY environment variable is required");
    }

    // Initialize services before creating server
    initializePromptService(apiKey);
    initializeResourceService(apiKey);
    initializeToolService(apiKey);

    // Create server instance directly
    const server = new Server(serverConfig, serverCapabilities);

    // Register all other handlers
    server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
    server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
    server.setRequestHandler(ListToolsRequestSchema, handleListTools);
    server.setRequestHandler(CallToolRequestSchema, handleToolCall);
    server.setRequestHandler(ListPromptsRequestSchema, handleListPrompts);
    server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);

    const transport = new StdioServerTransport();

    // Connect to transport and keep running
    await server.connect(transport);

    // Log success but don't exit
    console.log("Server connected and running");
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
