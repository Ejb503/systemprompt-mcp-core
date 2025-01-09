import { Server } from "@modelcontextprotocol/sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeService } from "./services/systemprompt-service.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";
import {
  handleListResources,
  handleResourceCall,
} from "./handlers/resource-handlers.js";
import { handleListTools, handleToolCall } from "./handlers/tool-handlers.js";
import {
  handleListPrompts,
  handleGetPrompt,
} from "./handlers/prompt-handlers.js";

export async function startServer(apiKey: string): Promise<Server> {
  try {
    // Initialize services
    initializeService(apiKey);

    // Create and configure server
    const server = new Server(serverConfig, serverCapabilities);

    // Register handlers
    server.handle("resources/list", handleListResources);
    server.handle("resources/call", handleResourceCall);
    server.handle("tools/list", handleListTools);
    server.handle("tools/call", handleToolCall);
    server.handle("prompts/list", handleListPrompts);
    server.handle("prompts/get", handleGetPrompt);

    // Create and start transport
    const transport = new StdioServerTransport();
    await transport.start(server);

    return server;
  } catch (error) {
    console.error("Fatal error:", error);
    throw error;
  }
}

// Run server if this is the main module
if (import.meta.url === new URL(import.meta.url).href) {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error(
      "API key is required. Usage: systemprompt-agent-server <API_KEY>"
    );
    process.exit(1);
  }

  startServer(apiKey).catch(() => process.exit(1));
}
