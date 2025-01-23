import type { JSONSchema7 } from "json-schema";

export const SystempromptBlockRequestSchema: JSONSchema7 = {
  type: "object",
  properties: {
    content: {
      type: "string",
    },
    prefix: {
      type: "string",
      description:
        "The prefix to use for the block. Must have no spaces or special characters.",
    },
    metadata: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: ["null", "string"],
        },
        log_message: {
          type: "string",
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  required: ["content", "metadata", "prefix"],
  $schema: "http://json-schema.org/draft-07/schema#",
};
