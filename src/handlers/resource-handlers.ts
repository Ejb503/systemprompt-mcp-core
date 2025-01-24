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
  mapAgentsToListResourcesResult,
  mapAgentToReadResourceResult
} from "../utils/mcp-mappers.js";

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  try {
    const service = SystemPromptService.getInstance();
    const blocks = await service.listBlocks();
    const agents = await service.listAgents();
    
    const blockResources = mapBlocksToListResourcesResult(blocks);
    const agentResources = mapAgentsToListResourcesResult(agents);
    
    return {
      _meta: {},
      resources: [...blockResources.resources, ...agentResources.resources],
    };
  } catch (error: any) {
    console.error("Failed to fetch resources:", error);
    throw new Error(
      `Failed to fetch resources from systemprompt.io: ${
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
    
    const blockMatch = uri.match(/^resource:\/\/\/block\/(.+)$/);
    const agentMatch = uri.match(/^resource:\/\/\/agent\/(.+)$/);

    if (!blockMatch && !agentMatch) {
      throw new Error(
        "Invalid resource URI format - expected resource:///block/{id} or resource:///agent/{id}"
      );
    }

    if (blockMatch) {
      const blockId = blockMatch[1];
      const block = await service.getBlock(blockId);
      return mapBlockToReadResourceResult(block);
    } else if (agentMatch) {
      const agentId = agentMatch[1];
      const agent = await service.getAgent(agentId);
      return mapAgentToReadResourceResult(agent);
    }

    throw new Error("Failed to process resource request");
  } catch (error: any) {
    console.error("Failed to fetch resource:", error);
    throw new Error(
      `Failed to fetch resource from systemprompt.io: ${
        error.message || "Unknown error"
      }`
    );
  }
}
