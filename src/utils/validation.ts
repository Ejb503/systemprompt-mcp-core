import type { ErrorObject } from "ajv";
import type { JSONSchema7 } from "json-schema";
import {Ajv} from "ajv";

// Using type assertion to help TypeScript understand the constructor
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  strictSchema: false,
  strictTypes: false,
});

/**
 * Validates data against a schema and throws an error with details if validation fails
 */
export function validateWithErrors(data: unknown, schema: JSONSchema7): void {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors
      ?.map((e: ErrorObject) => {
        if (e.keyword === "required") {
          const property = (e.params as any).missingProperty;
          // Map property names to expected error messages
          const errorMap: Record<string, string> = {
            params: "Request must have params",
            messages: "Request must have at least one message",
            content: "Message must have a content object",
            text: "Text content must have a string text field",
            data: "Image content must have a base64 data field",
            mimeType: "Image content must have a mimeType field",
            type: "Message content must have a type field",
            title: "Missing required field: title",
            description: "Missing required field: description",
            static: "Missing required field: static instruction",
            dynamic: "Missing required field: dynamic instruction",
            state: "Missing required field: state",
            input_type: "Missing required field: input type",
            output_type: "Missing required field: output type",
          };
          return errorMap[property] || `Missing required field: ${property}`;
        }
        if (e.keyword === "minimum" && (e.params as any).limit === 1) {
          if ((e as any).instancePath === "/params/maxTokens") {
            return "maxTokens must be a positive number";
          }
          if ((e as any).instancePath === "/params/messages") {
            return "Request must have at least one message";
          }
        }
        if (e.keyword === "maximum" && (e.params as any).limit === 1) {
          if ((e as any).instancePath === "/params/temperature") {
            return "Temperature must be between 0 and 1";
          }
          if ((e as any).instancePath.includes("Priority")) {
            return "Priority values must be between 0 and 1";
          }
        }
        if (e.keyword === "enum") {
          if ((e as any).instancePath === "/params/includeContext") {
            return 'includeContext must be one of: "none", "thisServer", or "allServers"';
          }
          if ((e as any).instancePath.includes("/role")) {
            return 'Message role must be either "user" or "assistant"';
          }
          if ((e as any).instancePath.includes("/type")) {
            return 'Content type must be either "text" or "image"';
          }
        }
        if (e.keyword === "type") {
          if ((e as any).instancePath.includes("/text")) {
            return "Text content must be a string";
          }
        }
        if (
          e.keyword === "minItems" &&
          (e as any).instancePath === "/params/messages"
        ) {
          return "Request must have at least one message";
        }
        return e.message || "Unknown validation error";
      })
      .join(", ");
    throw new Error(errors);
  }
}

// Schema for validating sampling requests
const samplingRequestSchema: JSONSchema7 = {
  type: "object",
  required: ["method", "params"],
  properties: {
    method: { type: "string", enum: ["sampling/createMessage"] },
    params: {
      type: "object",
      required: ["messages"],
      properties: {
        messages: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["role", "content"],
            properties: {
              role: { type: "string", enum: ["user", "assistant"] },
              content: {
                oneOf: [
                  {
                    type: "object",
                    required: ["type", "text"],
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    required: ["type", "data", "mimeType"],
                    properties: {
                      type: { type: "string", enum: ["image"] },
                      data: { type: "string" },
                      mimeType: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                ],
              },
            },
          },
        },
        maxTokens: { type: "number", minimum: 1 },
        temperature: { type: "number", minimum: 0, maximum: 1 },
        includeContext: {
          type: "string",
          enum: ["none", "thisServer", "allServers"],
        },
        modelPreferences: {
          type: "object",
          properties: {
            costPriority: { type: "number", minimum: 0, maximum: 1 },
            speedPriority: { type: "number", minimum: 0, maximum: 1 },
            intelligencePriority: { type: "number", minimum: 0, maximum: 1 },
          },
        },
      },
    },
  },
};

/**
 * Validates a request against a schema
 */
export function validateRequest(request: unknown): void {
  validateWithErrors(request, samplingRequestSchema);
}
