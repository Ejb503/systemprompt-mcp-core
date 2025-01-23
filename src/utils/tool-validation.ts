import type { CallToolRequest, Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "../constants/tools.js";
import type { JSONSchema7 } from "json-schema";
import { validateWithErrors } from "./validation.js";

/**
 * Validates a tool request and returns the tool configuration if valid
 */
export function validateToolRequest(request: CallToolRequest): Tool {
  if (!request.params?.name) {
    throw new Error("Invalid tool request: missing tool name");
  }

  const tool = TOOLS.find((t: Tool) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  // Validate arguments against the tool's schema if present
  if (tool.inputSchema && request.params.arguments) {
    validateWithErrors(
      request.params.arguments,
      tool.inputSchema as JSONSchema7
    );
  }

  return tool;
}

/**
 * Gets the schema for a tool by name
 */
export function getToolSchema(toolName: string): JSONSchema7 | undefined {
  const tool = TOOLS.find((t: Tool) => t.name === toolName);
  return tool?.inputSchema as JSONSchema7;
}
