import { PromptTemplate } from "../types/index.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import type { Block } from "../types/index.js";

export interface Resource {
  uri: string;
  mimeType: string;
  name: string;
  description: string;
}

export interface ResourceCallRequest {
  params: {
    uri: string;
  };
}

const systemPromptService = new SystemPromptService();

export async function handleListResources() {
  try {
    const blocks = await systemPromptService.listBlocks();

    return {
      resources: blocks.map((block: Block) => ({
        uri: `resource:///block/${block.id}`,
        mimeType: "text/plain",
        name: block.name,
        description: block.description || `${block.type} block: ${block.name}`,
      })),
    };
  } catch (error: any) {
    throw new Error(
      `Failed to fetch blocks: ${error.message || "Unknown error"}`
    );
  }
}

export async function handleResourceCall(request: ResourceCallRequest) {
  const { uri } = request.params;
  const match = uri.match(/^resource:\/\/\/block\/(.+)$/);

  if (!match) {
    throw new Error(
      "Invalid resource URI format - expected resource:///block/{id}"
    );
  }

  const blockId = match[1];

  try {
    const block = await systemPromptService.getBlock(blockId);

    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: block.content,
        },
      ],
    };
  } catch (error: any) {
    throw new Error(
      `Failed to fetch block content: ${error.message || "Unknown error"}`
    );
  }
}
