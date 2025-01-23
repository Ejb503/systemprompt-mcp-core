import type { JSONSchema7 } from "json-schema";

export const SystempromptPromptRequestSchema: JSONSchema7 = {
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "description": {
          "type": [
            "null",
            "string"
          ]
        },
        "created": {
          "type": "string"
        },
        "updated": {
          "type": "string"
        },
        "version": {
          "type": "number"
        },
        "status": {
          "type": "string"
        },
        "author": {
          "type": "string"
        },
        "log_message": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "instruction": {
      "type": "object",
      "properties": {
        "static": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "required": [
        "static"
      ]
    },
    "input": {
      "type": "object",
      "properties": {
        "type": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "additionalProperties": false,
      "required": [
        "type"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "type": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "additionalProperties": false,
      "required": [
        "type"
      ]
    }
  },
  "additionalProperties": false,
  "required": [
    "input",
    "instruction",
    "metadata",
    "output"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
};
