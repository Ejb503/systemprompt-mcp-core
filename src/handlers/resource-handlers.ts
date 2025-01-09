import { SystemPromptService } from "../services/systemprompt-service.js";
import type {
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";

let systemPromptService: SystemPromptService;

export function initializeService(apiKey: string) {
  systemPromptService = SystemPromptService.getInstance();
  systemPromptService.initialize(apiKey);
}

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  try {
    const blocks = await systemPromptService.listblock();
    return {
      resources: blocks.map((block) => ({
        uri: `resource:///block/${block.id}`,
        name: block.metadata.title,
        description: block.metadata.description,
        mimeType: "text/plain",
      })),
    };
  } catch (error: any) {
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
    return await fetchResource(blockId);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch block from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}

async function fetchResource(blockId: string): Promise<ReadResourceResult> {
  const block = await systemPromptService.getBlock(blockId);
  return {
    contents: [
      {
        uri: `resource:///block/${blockId}`,
        mimeType: "text/plain",
        text: block.content,
        metadata: {
          id: block.id,
          type: "block",
          name: block.metadata.title,
          description: block.metadata.description || "",
        },
      },
    ],
  };
}
