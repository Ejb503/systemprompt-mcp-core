import { PromptTemplate } from "../types/index.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import type { Block } from "../types/index.js";
import { handleServiceError } from "../utils/error-handling.js";
import { parseResourceUri, createResourceUri, ResourceUriError } from "../utils/uri-parser.js";

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

export async function handleListResources(service: SystemPromptService = new SystemPromptService()) {
  try {
    const blocks = await service.listBlocks();

    return {
      resources: blocks.map((block: Block) => ({
        uri: createResourceUri('block', block.id),
        mimeType: "text/plain",
        name: block.name,
        description: block.description || `${block.type} block: ${block.name}`,
      })),
    };
  } catch (error) {
    handleServiceError(error, "fetch blocks");
  }
}

export async function handleResourceCall(
  request: ResourceCallRequest,
  service: SystemPromptService = new SystemPromptService()
) {
  try {
    const { type, id } = parseResourceUri(request.params.uri);

    // Currently we only support block resources
    if (type !== 'block') {
      throw new ResourceUriError(`Unsupported resource type: ${type}`);
    }

    const block = await service.getBlock(id);

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/plain",
          text: block.content,
        },
      ],
    };
  } catch (error) {
    if (error instanceof ResourceUriError) {
      throw error;
    }
    handleServiceError(error, "fetch block content");
  }
}
