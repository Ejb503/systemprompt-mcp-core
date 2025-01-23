import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  CallToolRequest,
  CallToolResult,
  CreateMessageResult,
  ListToolsRequest,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "../constants/tools.js";
import { sendSamplingRequest } from "./sampling.js";
import { handleGetPrompt } from "./prompt-handlers.js";
import { injectVariables } from "../utils/message-handlers.js";
import {
  CREATE_PROMPT_PROMPT,
  EDIT_PROMPT_PROMPT,
  CREATE_BLOCK_PROMPT,
  EDIT_BLOCK_PROMPT,
  CREATE_AGENT_PROMPT,
  EDIT_AGENT_PROMPT,
} from "../constants/sampling-prompts.js";
import type {
  SystempromptPromptRequest,
  SystempromptBlockRequest,
  SystempromptAgentRequest,
} from "../types/index.js";

export async function handleListTools(
  request: ListToolsRequest
): Promise<ListToolsResult> {
  return { tools: TOOLS };
}

export async function handleToolCall(
  request: CallToolRequest
): Promise<CallToolResult> {
  try {
    const service = SystemPromptService.getInstance();
    switch (request.params.name) {
      case "systemprompt_heartbeat": {
        const result = await service.fetchUserStatus();
        const user = result.user;
        const billing = result.billing;
        const apiKey = result.api_key;
        const markdown = [
          "## API Key",
          `- **Key**: ${apiKey}`,
          "",
          "## User Information",
          `- **Name**: ${user.name}`,
          `- **Email**: ${user.email}`,
          `- **Roles**: ${user.roles.join(", ")}`,
          "",
          "## Billing",
          "### Customer",
          `- **ID**: ${billing?.customer?.id || "N/A"}`,
          `- **Email**: ${billing?.customer?.email || "N/A"}`,
          `- **Status**: ${billing?.customer?.status || "N/A"}`,
          "",
          "### Active Subscriptions",
          ...(billing?.subscription || [])
            .filter((sub: { status: string }) => sub.status === "active")
            .map(
              (sub: {
                id: string;
                status: string;
                currency_code: string;
                billing_cycle: { frequency: number; interval: string };
                current_billing_period: { starts_at: string; ends_at: string };
                items: Array<{
                  product: { name: string };
                  price: {
                    unit_price: { amount: string; currency_code: string };
                  };
                }>;
              }) => [
                `#### Subscription ${sub.id}`,
                `- **Status**: ${sub.status}`,
                `- **Currency**: ${sub.currency_code}`,
                `- **Billing Cycle**: ${sub.billing_cycle.frequency} ${sub.billing_cycle.interval}`,
                `- **Current Period**: ${new Date(
                  sub.current_billing_period.starts_at
                ).toLocaleDateString()} to ${new Date(
                  sub.current_billing_period.ends_at
                ).toLocaleDateString()}`,
                `- **Product**: ${sub.items[0].product.name}`,
                `- **Price**: ${
                  parseInt(sub.items[0].price.unit_price.amount) / 100
                } ${sub.items[0].price.unit_price.currency_code}`,
                "",
              ]
            )
            .flat(),
        ].join("\n");
        return {
          content: [{ type: "text", text: markdown }],
        };
      }
      case "systemprompt_fetch_resources": {
        const prompts = await service.getAllPrompts();
        const blocks = await service.listBlocks();
        const agents = await service.listAgents();

        const markdown = [
          "## Agents",
          ...agents
            .map((agent) => [
              `#### ${agent.metadata.title}`,
              `- **ID**: ${agent.id}`,
              `- **Description**: ${agent.metadata.description || "N/A"}`,
              "",
            ])
            .flat(),
          "",
          "### Prompts",
          ...prompts
            .map((prompt) => [
              `#### ${prompt.metadata.title}`,
              `- **ID**: ${prompt.id}`,
              `- **Description**: ${prompt.metadata.description || "N/A"}`,
              "",
            ])
            .flat(),
          "",
          "### Resources",
          ...blocks
            .map((block) => [
              `#### ${block.metadata.title}`,
              `- **ID**: ${block.id}`,
              `- **Description**: ${block.metadata.description || "N/A"}`,
              "",
            ])
            .flat(),
        ].join("\n");

        return {
          content: [{ type: "text", text: markdown }],
        };
      }
      case "systemprompt_create_resource": {
        const { type, userInstructions } = request.params.arguments as {
          type?: "prompt" | "block" | "agent";
          userInstructions?: string;
        };
        if (!type || !userInstructions) {
          throw new Error(
            "Tool call failed: Missing required parameters - type and userInstructions are required"
          );
        }

        // Get the appropriate prompt based on resource type
        const promptMap = {
          prompt: CREATE_PROMPT_PROMPT,
          block: CREATE_BLOCK_PROMPT,
          agent: CREATE_AGENT_PROMPT,
        } as const;
        const selectedPrompt = promptMap[type];
        if (!selectedPrompt) {
          throw new Error(`Invalid resource type: ${type}`);
        }

        // Get the prompt with user instructions
        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: selectedPrompt.name,
            arguments: { userInstructions },
          },
        });

        await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: prompt.messages.map((msg) =>
              injectVariables(msg, { userInstructions })
            ) as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: 100000,
            temperature: 0.7,
            _meta: prompt._meta,
            arguments: { userInstructions },
          },
        });

        return {
          content: [
            {
              type: "text",
              text: `Your request has been recieved and is being processed, we will notify you when it is complete.`,
            },
          ],
        };
      }
      case "systemprompt_update_resource": {
        const { id, type, userInstructions } = request.params.arguments as {
          id?: string;
          type?: "prompt" | "block" | "agent";
          userInstructions?: string;
        };
        if (!id || !type || !userInstructions) {
          throw new Error(
            "Tool call failed: Missing required parameters - id, type and userInstructions are required"
          );
        }

        // Get the appropriate prompt based on resource type
        const promptMap = {
          prompt: EDIT_PROMPT_PROMPT,
          block: EDIT_BLOCK_PROMPT,
          agent: EDIT_AGENT_PROMPT,
        } as const;
        const selectedPrompt = promptMap[type];
        if (!selectedPrompt) {
          throw new Error(`Invalid resource type: ${type}`);
        }

        // Get the prompt with user instructions
        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: selectedPrompt.name,
            arguments: { userInstructions },
          },
        });

        // Send sampling request
        const result = await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: prompt.messages.map((msg) =>
              injectVariables(msg, { userInstructions })
            ) as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: 100000,
            temperature: 0.7,
            _meta: prompt._meta,
            arguments: { userInstructions },
          },
        });
        return {
          content: [
            {
              type: "text",
              text: `Your request has been recieved and is being processed, we will notify you when it is complete.`,
            },
          ],
        };
      }
      case "systemprompt_delete_resource": {
        const params = request.params.arguments as { id: string };
        const { id } = params;
        if (!id) {
          throw new Error("ID is required for deleting a resource");
        }

        try {
          await service.deletePrompt(id);
          return {
            content: [
              { type: "text", text: `Successfully deleted prompt ${id}` },
            ],
          };
        } catch {
          try {
            await service.deleteBlock(id);
            return {
              content: [
                { type: "text", text: `Successfully deleted block ${id}` },
              ],
            };
          } catch {
            throw new Error(`Failed to delete resource with ID ${id}`);
          }
        }
      }
      default: {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
    }
  } catch (error: any) {
    console.error("Tool call failed:", error);
    throw new Error(`Tool call failed: ${error.message || "Unknown error"}`);
  }
}
