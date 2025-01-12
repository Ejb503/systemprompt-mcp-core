import { BlockService } from "../services/block-service.js";
import { parseResourceUri } from "../utils/uri-parser.js";
import { handleServiceError, ApiError } from "../utils/error-handling.js";

export const blockService = new BlockService(process.env.API_KEY || '');

export async function handleListResources(
  request: { method: "resources/list"; params?: { _meta?: { progressToken?: string | number } } }
) {
  try {
    const blocks = await blockService.listBlocks();
    return {
      resources: blocks.map((block) => ({
        uri: `resource:///block/${block.id}`,
        name: block.name,
        description: block.description,
        mimeType: "text/plain",
        type: "block",
        blockType: block.type
      }))
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw handleServiceError(error, "fetch blocks");
  }
}

export async function handleResourceCall(
  request: { method: "resources/read"; params: { uri: string; _meta?: { progressToken?: string | number } } }
) {
  const { uri } = request.params;
  const { id } = parseResourceUri(uri);

  try {
    const block = await blockService.getBlock(id);
    return {
      contents: [
        {
          uri: `resource:///block/${block.id}`,
          mimeType: "text/plain",
          text: block.content
        }
      ]
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw handleServiceError(error, "fetch block content");
  }
}
