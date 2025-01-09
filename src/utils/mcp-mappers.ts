import {
  GetPromptResult,
  ListResourcesResult,
  ListPromptsResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  SystempromptPromptResponse,
  SystempromptBlockResponse,
} from "../types/index.js";

/**
 * Maps a single prompt to the MCP GetPromptResult format.
 * Used when retrieving a single prompt's details.
 */
export function mapPromptToGetPromptResult(
  prompt: SystempromptPromptResponse
): GetPromptResult {
  return {
    id: prompt.id,
    metadata: {
      title: prompt.metadata.title,
      description: prompt.metadata.description,
      created: prompt.metadata.created,
      updated: prompt.metadata.updated,
      version: prompt.metadata.version,
      status: prompt.metadata.status,
      author: prompt.metadata.author,
      log_message: prompt.metadata.log_message,
    },
    instruction: {
      static: prompt.instruction.static,
      dynamic: prompt.instruction.dynamic,
      state: prompt.instruction.state,
    },
    input: {
      name: prompt.input.name,
      description: prompt.input.description,
      type: prompt.input.type,
      schema: prompt.input.schema,
    },
    output: {
      name: prompt.output.name,
      description: prompt.output.description,
      type: prompt.output.type,
      schema: prompt.output.schema,
    },
    messages: [], // Required by MCP schema
    _link: prompt._link,
  };
}

/**
 * Maps an array of prompts to the MCP ListPromptsResult format.
 * Used when listing multiple prompts.
 */
export function mapPromptsToListPromptsResult(
  prompts: SystempromptPromptResponse[]
): ListPromptsResult {
  return {
    prompts: prompts.map((prompt) => ({
      name: prompt.metadata.title,
      description: prompt.metadata.description,
      arguments: [],
    })),
    _meta: {},
  };
}

/**
 * Maps a single block to the MCP ReadResourceResult format.
 * Used when retrieving a single block's details.
 */
export function mapBlockToReadResourceResult(
  block: SystempromptBlockResponse
): ReadResourceResult {
  return {
    contents: [
      {
        uri: block.id,
        mimeType: "text/plain",
        text: block.content,
      },
    ],
    _meta: {},
  };
}

/**
 * Maps an array of blocks to the MCP ListResourcesResult format.
 * Used when listing multiple blocks.
 */
export function mapBlocksToListResourcesResult(
  blocks: SystempromptBlockResponse[]
): ListResourcesResult {
  return {
    resources: blocks.map((block) => ({
      uri: block.id,
      name: block.metadata.title,
      description: block.metadata.description || undefined,
      mimeType: "text/plain",
    })),
    _meta: {},
  };
}
