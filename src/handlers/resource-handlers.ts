import { SystemPromptService } from "../services/systemprompt-service.js";
import { handleServiceError } from "../utils/error-handling.js";
import { parseResourceUri, ResourceUriError } from "../utils/uri-parser.js";
import { BlockResource, ResourceContent, mapBlocksToResources, mapBlockToContent } from "../utils/resource-mapper.js";

export interface ResourceCallRequest {
  params: {
    uri: string;
  };
}

export interface ResourceListResponse {
  resources: BlockResource[];
}

export interface ResourceCallResponse {
  contents: ResourceContent[];
}

export async function handleListResources(
  service: SystemPromptService = new SystemPromptService()
): Promise<ResourceListResponse> {
  try {
    const blocks = await service.listBlocks();
    return {
      resources: mapBlocksToResources(blocks),
    };
  } catch (error) {
    return handleServiceError(error, "fetch blocks");
  }
}

export async function handleResourceCall(
  request: ResourceCallRequest,
  service: SystemPromptService = new SystemPromptService()
): Promise<ResourceCallResponse> {
  try {
    const { type, id } = parseResourceUri(request.params.uri);

    // Currently we only support block resources
    if (type !== 'block') {
      throw new ResourceUriError(`Unsupported resource type: ${type}`);
    }

    const block = await service.getBlock(id);
    return {
      contents: [mapBlockToContent(block, request.params.uri)],
    };
  } catch (error) {
    if (error instanceof ResourceUriError) {
      throw error;
    }
    return handleServiceError(error, "fetch block content");
  }
}
