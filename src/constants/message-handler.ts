import { JSONSchema7, JSONSchema7TypeName } from "json-schema";

export const ERROR_MESSAGES = {
  INVALID_REQUEST: {
    MISSING_MESSAGES: "Invalid request: missing messages",
    MISSING_PARAMS: "Request must have params",
    EMPTY_MESSAGES: "Request must have at least one message",
  },
  VALIDATION: {
    INVALID_ROLE: 'Message role must be either "user" or "assistant"',
    MISSING_CONTENT: "Message must have a content object",
    INVALID_CONTENT_TYPE: 'Content type must be either "text" or "image"',
    INVALID_TEXT_CONTENT: "Text content must have a string text field",
    INVALID_IMAGE_DATA: "Image content must have a base64 data field",
    INVALID_IMAGE_MIME: "Image content must have a mimeType field",
    INVALID_MAX_TOKENS: "maxTokens must be a positive number",
    INVALID_TEMPERATURE: "temperature must be a number between 0 and 1",
    INVALID_INCLUDE_CONTEXT:
      'includeContext must be "none", "thisServer", or "allServers"',
    INVALID_MODEL_PRIORITY:
      "Model preference priorities must be numbers between 0 and 1",
  },
  SAMPLING: {
    EXPECTED_TEXT: "Expected text response from LLM",
    UNKNOWN_CALLBACK: "Unknown callback type: ",
    REQUEST_FAILED: "Sampling request failed: ",
  },
} as const;

export const VALID_ROLES = ["user", "assistant"] as const;
export const VALID_CONTENT_TYPES = ["text", "image", "resource"] as const;
export const VALID_INCLUDE_CONTEXT = [
  "none",
  "thisServer",
  "allServers",
] as const;

export const XML_TAGS = {
  REQUEST_PARAMS_CLOSE: "</requestParams>",
  EXISTING_CONTENT_TEMPLATE: (content: string) => `</requestParams>
  <existingContent>
    ${content}
  </existingContent>`,
} as const;
