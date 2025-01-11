import { BlockService } from "../services/block-service.js";
import { parseResourceUri } from "../utils/uri-parser.js";
import { handleServiceError, ApiError } from "../utils/error-handling.js";

export async function handleListResources(service: BlockService) {
  try {
    const blocks = await service.listBlocks();
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

export async function handleResourceCall(request: { params: { uri: string } }, service: BlockService) {
  const { uri } = request.params;
  const { id } = parseResourceUri(uri);

  try {
    const block = await service.getBlock(id);
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
    const message = error instanceof Error ? error.message || "Unknown error" : "Unknown error";
    throw handleServiceError({ message }, "fetch block content");
  }
}
