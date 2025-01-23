import {
  Implementation,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

export const serverConfig: Implementation = {
  name: "systemprompt-agent-server",
  version: "1.0.0",
  metadata: {
    name: "System Prompt Agent Server",
    description:
      "A specialized MCP server for creating and managing systemprompt.io compatible prompts",
    icon: "solar:align-horizontal-center-line-duotone",
    color: "primary",
    serverStartTime: Date.now(),
    environment: process.env.NODE_ENV,
    customData: {
      serverFeatures: ["agent", "prompts", "systemprompt"],
    },
  },
};

export const serverCapabilities: { capabilities: ServerCapabilities } = {
  capabilities: {
    resources: {
      listChanged: true,
    },
    tools: {},
    prompts: {
      listChanged: true,
    },
    sampling: {},
    logging: {},
  },
};
