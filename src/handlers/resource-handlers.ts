import {
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceResult,
  ReadResourceRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import type { Block } from "../types/index.js";

let systemPromptService: SystemPromptService;

export function initializeService(apiKey: string) {
  systemPromptService = new SystemPromptService();
  systemPromptService.initialize(apiKey);
}

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  try {
    const blocks = await systemPromptService.listblock();
    return {
      resources: blocks.map((block: Block) => convertToMCPResource(block)),
    };
  } catch (error) {
    throw new Error(`Failed to list resources: ${error}`);
  }
}

export async function handleResourceCall(
  request: ReadResourceRequest
): Promise<ReadResourceResult> {
  try {
    const { uri } = request.params;
    const match = uri.match(/^resource:\/\/\/block\/(.+)$/);

    if (!match) {
      throw new Error(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    }

    const blockId = match[1];
    const block = await systemPromptService.getBlock(blockId);

    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: block.content,
          metadata: {
            id: block.id,
            type: "block",
            name: block.metadata.title,
            description: block.metadata.description,
          },
        },
      ],
    };
  } catch (error: any) {
    console.error("Failed to fetch block:", error);
    throw new Error(
      `Failed to fetch block from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}

function convertToMCPResource(block: Block) {
  return {
    uri: `resource:///block/${block.id}`,
    mimeType: "text/plain",
    name: block.metadata.title,
    description: block.metadata.description,
    metadata: {
      id: block.id,
      type: "block",
    },
  };
}
