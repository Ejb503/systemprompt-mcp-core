import type { JSONSchema7 } from "json-schema";

export const SystempromptAgentRequestSchema: JSONSchema7 = {
  type: "object",
  properties: {
    content: {
      type: "string",
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
  required: ["content", "metadata"],
  $schema: "http://json-schema.org/draft-07/schema#",
};
