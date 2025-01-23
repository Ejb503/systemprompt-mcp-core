import type { JSONSchema7 } from "json-schema";

export const SystempromptPromptRequestSchema: JSONSchema7 = {
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the prompt",
        },
        description: {
          type: ["string"],
          description: "A detailed description of what the prompt does",
        },
        log_message: {
          type: "string",
          description: "A message to log when this prompt is used",
        },
        tag: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Tags to categorize the prompt",
        },
      },
      additionalProperties: false,
      required: ["title", "description"],
    },
    instruction: {
      type: "object",
      properties: {
        static: {
          type: "string",
          description:
            "The static instruction text that defines the prompt behavior",
        },
      },
      additionalProperties: false,
      required: ["static"],
    },
  },
  additionalProperties: false,
  required: ["instruction", "metadata"],
  $schema: "http://json-schema.org/draft-07/schema#",
};
