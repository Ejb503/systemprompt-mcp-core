import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  CallToolRequest,
  CallToolResult,
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
import type { SystempromptUserRequest } from "../types/systemprompt.js";

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
        const markdown = [
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
      case "systemprompt_introduction": {
        return {
          content: [{ type: "text", text: `# Systemprompt: The Future of Voice-Controlled AI Agents (Early Access)

## 🚀 Early Access Announcement
Systemprompt is currently in early access, offering pioneering users the opportunity to experience and shape the future of voice-controlled AI interactions. During this phase, we're actively gathering feedback and continuously enhancing our platform's capabilities.

## 🎯 Core Definition
Systemprompt is a groundbreaking platform that revolutionizes how we interact with AI agents through voice control and the Model Context Protocol (MCP). As a bridge between natural language and API functionality, it enables seamless integration of AI capabilities across various services and platforms.

## 🏗 Technical Architecture

### Core Foundation
- **MCP Protocol Integration**: 
  - Built on the open-source Model Context Protocol
  - Extended with advanced capabilities for voice interaction
  - Robust state management and context preservation

- **Multi-modal Interface**: 
  - Voice-first design philosophy
  - Seamless text-based fallback
  - Natural language processing optimization

- **Agent Server**: 
  - Specialized \`systemprompt-agent-server\`
  - Real-time agent management
  - Distributed processing capabilities

## 🔧 Key Features

### Resource Management
- **Prompts**: Advanced prompt creation and management system
- **Blocks**: Reusable components for building AI workflows
- **Agents**: Configurable AI agents with specific capabilities

### Tool Ecosystem
- **Prompt Management**: \`create_prompt\`, \`edit_prompt\`, \`get_prompt\`
- **Resource Management**: \`create_resource\`, \`edit_resource\`, \`list_resources\`
- **System Tools**: \`systemprompt_heartbeat\`, \`systemprompt_fetch_resources\`
- **Agent Management**: \`create_agent\`, \`edit_agent\`, \`list_agents\`

## 🌐 Current Integrations (Early Access)

### Available Now
- **Gmail**: Intelligent email management and composition
- **Notion**: AI-powered workspace organization

### Coming Soon
- **Slack**: Enhanced team communications
- **Reddit**: Intelligent community engagement
- **LinkedIn**: AI-assisted professional networking
- **Shopify**: Streamlined e-commerce operations
- **Drupal**: Advanced content management

## ⚙️ Development Features
- **SDK Integration**: Comprehensive development toolkit
- **Plugin Architecture**: Extensible system for custom integrations
- **Testing Framework**: Robust debugging and testing capabilities

## 🎛 Customization
- **Communication Style**: Adjustable formality, tone, verbosity, and technical level
- **Expertise Settings**: Configurable background and history
- **Personal Preferences**: Customizable interaction patterns

## 🔒 Security & Compliance
- Secure API key management
- Enterprise-grade authentication
- Comprehensive usage analytics

> Note: As an early access product, features and integrations are actively being developed and refined based on user feedback.` }],
        };
      }
      case "systemprompt_config": {
        const status = await service.fetchUserStatus();
        const params = request.params.arguments as {
          name?: string;
          communication_formality?: string;
          communication_tone?: string;
          communication_verbosity?: string;
          communication_technical?: string;
          expertise_background?: string;
          expertise_history?: string;
          personal_background?: string;
          personal_history?: string;
        };

        if (!params || Object.keys(params).length === 0) {
          throw new Error("No configuration parameters provided");
        }

        // Transform flat parameters into nested structure
        const validatedParams: Partial<{
          user?: { name: string };
          instruction?: DeepPartialInstruction;
        }> = {};
        
        // Handle user name
        if ('name' in params && params.name) {
          validatedParams.user = { name: params.name };
        }

        // Handle communication preferences
        type PartialCommunication = Partial<SystempromptUserRequest['instruction']['communication']>;
        type PartialExpertise = Partial<SystempromptUserRequest['instruction']['expertise']>;
        type PartialPersonal = Partial<SystempromptUserRequest['instruction']['personal']>;
        type DeepPartialInstruction = {
          communication?: PartialCommunication;
          expertise?: PartialExpertise;
          personal?: PartialPersonal;
        };

        const communication: PartialCommunication | undefined = ('communication_formality' in params || 
            'communication_tone' in params || 
            'communication_verbosity' in params || 
            'communication_technical' in params) ? {
            ...(params.communication_formality && { formality: params.communication_formality }),
            ...(params.communication_tone && { tone: params.communication_tone }),
            ...(params.communication_verbosity && { verbosity: params.communication_verbosity }),
            ...(params.communication_technical && { technical: params.communication_technical })
          } : undefined;

        // Handle expertise
        const expertise: PartialExpertise | undefined = ('expertise_background' in params || 'expertise_history' in params) ? {
            ...(params.expertise_background && { background: params.expertise_background }),
            ...(params.expertise_history && { history: params.expertise_history })
          } : undefined;

        // Handle personal
        const personal: PartialPersonal | undefined = ('personal_background' in params || 'personal_history' in params) ? {
            ...(params.personal_background && { background: params.personal_background }),
            ...(params.personal_history && { history: params.personal_history })
          } : undefined;

        // Only add instruction if we have any values
        if (communication || expertise || personal) {
          const partialInstruction: DeepPartialInstruction = {
            ...(communication && { communication }),
            ...(expertise && { expertise }),
            ...(personal && { personal })
          };
          validatedParams.instruction = partialInstruction as any;
        }

        if (!validatedParams.user && !validatedParams.instruction) {
          throw new Error("No valid configuration parameters provided");
        }

        // Send only the provided fields for partial update
        await service.editUser(status.user.uuid, validatedParams as any);
        const user = await service.fetchUserStatus();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user),
            },
          ],
          _meta: {
            callback: "refresh_systemprompt_user",
          },
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
      // case "systempromt_execute_prompt": {
      //   const { name } = request.params.arguments as {
      //     name: string;
      //   };
      //   if (!name) {
      //     throw new Error(
      //       "Tool call failed: Missing required parameters - id, type and userInstructions are required"
      //     );
      //   }

      //   const prompt = await handleGetPrompt({
      //     method: "prompts/get",
      //     params: {
      //       name: name,
      //       arguments: { userInstructions },
      //     },
      //   });

      //   await sendSamplingRequest({
      //     method: "sampling/createMessage",
      //     params: {
      //       messages: prompt.messages.map((msg) =>
      //         injectVariables(msg, { userInstructions })
      //       ) as Array<{
      //         role: "user" | "assistant";
      //         content: { type: "text"; text: string };
      //       }>,
      //       maxTokens: 100000,
      //       temperature: 0.7,
      //       _meta: prompt._meta,
      //       arguments: { userInstructions },
      //     },
      //   });
      //   return {
      //     content: [
      //       {
      //         type: "text",
      //         text: `Your request has been recieved and is being processed, we will notify you when it is complete.`,
      //       },
      //     ],
      //   };
      // }
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
