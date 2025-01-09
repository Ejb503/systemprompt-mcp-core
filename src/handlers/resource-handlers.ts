import { SystemPromptResource } from "../types/index.js";

/**
 * Represents a collection of available MCP resources
 * Each resource is mapped by its identifier and contains its metadata
 */
const RESOURCES: Record<string, SystemPromptResource> = {
  "api-schema": {
    uri: "resource:///api-schema",
    content: "https://api.systemprompt.io/v1/schema",
    type: "API Schema",
    description: "OpenAPI schema documentation for the SystemPrompt API",
  },
  "prompt-docs": {
    uri: "resource:///prompt-docs",
    content: "https://systemprompt.io/resource/prompt",
    type: "Prompt",
    description: "Documentation for the SystemPrompt prompt system",
  },
};

/**
 * Lists all available MCP resources with their metadata
 * @returns Promise resolving to an object containing the resources array
 */
export async function handleListResources() {
  return {
    resources: Object.values(RESOURCES).map((resource) => ({
      uri: resource.uri,
      mimeType: "text/plain",
      name: `${resource.type} Documentation`,
      description: resource.description,
    })),
  };
}

/**
 * Reads the content of a specific MCP resource
 * @param request Object containing the resource URI to read
 * @returns Promise resolving to the resource contents
 * @throws Error if the requested resource is not found
 */
export async function handleReadResource(request: { params: { uri: string } }) {
  const url = new URL(request.params.uri);
  const resourceId = url.pathname.replace(/^\//, "");
  const resource = RESOURCES[resourceId];

  if (!resource) {
    throw new Error(`Resource ${resourceId} not found`);
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/plain",
        text: resource.content,
      },
    ],
  };
}
