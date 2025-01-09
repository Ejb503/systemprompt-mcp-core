import {
  ReadResourceRequest,
  ListResourcesResult,
  ReadResourceResult,
  ListResourcesRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  mapBlockToReadResourceResult,
  mapBlocksToListResourcesResult,
} from "../utils/mcp-mappers.js";

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  try {
    const service = SystemPromptService.getInstance();
    const blocks = await service.listBlocks();
    return mapBlocksToListResourcesResult(blocks);
  } catch (error: any) {
    console.error("Failed to fetch blocks:", error);
    throw new Error(
      `Failed to fetch blocks from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}

export async function handleResourceCall(
  request: ReadResourceRequest
): Promise<ReadResourceResult> {
  try {
    const service = SystemPromptService.getInstance();
    const { uri } = request.params;
    const match = uri.match(/^resource:\/\/\/block\/(.+)$/);

    if (!match) {
      throw new Error(
        "Invalid resource URI format - expected resource:///block/{id}"
      );
    }

    const blockId = match[1];
    const block = await service.getBlock(blockId);
    return mapBlockToReadResourceResult(block);
  } catch (error: any) {
    console.error("Failed to fetch block:", error);
    throw new Error(
      `Failed to fetch block from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}
