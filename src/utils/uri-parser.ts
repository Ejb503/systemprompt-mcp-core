import { ApplicationError } from './error-handling.js';

/**
 * Represents a parsed resource URI with its components.
 * Resource URIs follow the format: resource:///{type}/{id}
 */
export interface ParsedResourceUri {
  /** The type of resource (e.g., 'block') */
  type: string;
  /** The unique identifier of the resource */
  id: string;
}

/**
 * Regular expression for validating resource URIs.
 * Format: resource:///{type}/{id}
 * 
 * Regex breakdown:
 * ^resource:\/\/\/      - Matches the start of string followed by "resource:///"
 * ([a-zA-Z0-9_]+)      - Capture group 1 (type): One or more alphanumeric chars or underscores
 * \/                    - Matches a forward slash
 * ([a-zA-Z0-9\-]+)     - Capture group 2 (id): One or more alphanumeric chars or hyphens
 * $                     - End of string
 * 
 * - type: alphanumeric characters and underscores
 * - id: alphanumeric characters and hyphens
 */
const RESOURCE_URI_REGEX = /^resource:\/\/\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9\-]+)$/;

/**
 * Regular expression for validating resource IDs.
 * - Must contain only alphanumeric characters and hyphens
 * - Length between 1 and 128 characters
 */
const RESOURCE_ID_REGEX = /^[a-zA-Z0-9\-]{1,128}$/;

/**
 * Error thrown when URI parsing or creation fails.
 * This error extends ApplicationError to maintain consistent error handling.
 * 
 * @example
 * ```ts
 * throw new ResourceUriError('Invalid resource ID format');
 * ```
 */
export class ResourceUriError extends ApplicationError {
  constructor(message: string) {
    super(message, 'ResourceUriError');
  }
}

/**
 * Set of valid resource types.
 * Add new resource types here as they are supported.
 */
const VALID_RESOURCE_TYPES = new Set(['block']);

/**
 * Checks if a resource type is supported.
 * Case-insensitive comparison is used for flexibility.
 * 
 * @param type - The resource type to validate
 * @returns True if the type is supported, false otherwise
 * 
 * @example
 * ```ts
 * if (isValidResourceType('block')) {
 *   // Handle block resource
 * }
 * ```
 */
function isValidResourceType(type: string): boolean {
  return VALID_RESOURCE_TYPES.has(type.toLowerCase());
}

/**
 * Parses a resource URI into its components.
 * The URI must follow the format: resource:///{type}/{id}
 * 
 * Validation rules:
 * - Must match the resource URI format exactly
 * - Type must be a supported resource type
 * - ID must be alphanumeric with hyphens, 1-128 chars
 * 
 * @param uri - The resource URI to parse
 * @returns The parsed URI components
 * @throws {ResourceUriError} If the URI format is invalid or contains invalid components
 * 
 * @example
 * ```ts
 * // Valid URI
 * const { type, id } = parseResourceUri('resource:///block/123');
 * // type = 'block', id = '123'
 * 
 * // Invalid URI - throws ResourceUriError
 * parseResourceUri('invalid://uri');
 * ```
 */
export function parseResourceUri(uri: string): ParsedResourceUri {
  const match = uri.match(RESOURCE_URI_REGEX);

  if (!match || match.length < 3) {
    throw new ResourceUriError(
      'Invalid resource URI format - expected "resource:///{type}/{id}" where type contains only alphanumeric characters and underscores, and id contains only alphanumeric characters and hyphens'
    );
  }

  // Destructure the match array:
  // [0] contains the entire matched string (full URI)
  // [1] contains the first capture group (type): alphanumeric + underscore
  // [2] contains the second capture group (id): alphanumeric + hyphen
  const [, type, id] = match;

  if (!isValidResourceType(type)) {
    throw new ResourceUriError(`Unsupported resource type: ${type}`);
  }

  if (!id || !RESOURCE_ID_REGEX.test(id)) {
    throw new ResourceUriError('Invalid resource ID format - ID must contain only alphanumeric characters and hyphens, and be between 1 and 128 characters');
  }

  return { type, id };
}

/**
 * Creates a resource URI from its components.
 * This is the inverse operation of parseResourceUri.
 * 
 * Validation rules:
 * - Type must be a supported resource type
 * - ID must be alphanumeric with hyphens, 1-128 chars
 * 
 * @param type - The resource type (e.g., "block")
 * @param id - The resource ID
 * @returns The formatted URI
 * @throws {ResourceUriError} If the components are invalid
 * 
 * @example
 * ```ts
 * // Valid components
 * const uri = createResourceUri('block', '123');
 * // uri = 'resource:///block/123'
 * 
 * // Invalid type - throws ResourceUriError
 * createResourceUri('invalid', '123');
 * ```
 */
export function createResourceUri(type: string, id: string): string {
  if (!isValidResourceType(type)) {
    throw new ResourceUriError(`Unsupported resource type: ${type}`);
  }

  if (!id || !RESOURCE_ID_REGEX.test(id)) {
    throw new ResourceUriError('Invalid resource ID format - ID must contain only alphanumeric characters and hyphens, and be between 1 and 128 characters');
  }

  return `resource:///${type}/${id}`;
}