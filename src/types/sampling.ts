import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { Prompt } from "@modelcontextprotocol/sdk/types.js";
import { JSONSchema7 } from "json-schema";

/**
 * Represents a sampling prompt that extends the base MCP Prompt.
 * Used for generating sampling prompts and handling sampling operations.
 */
export interface SamplingPrompt extends Prompt {
  messages: PromptMessage[];
  _meta: {
    complexResponseSchema?: JSONSchema7;
    responseSchema?: JSONSchema7;
    callback: string;
  };
}
