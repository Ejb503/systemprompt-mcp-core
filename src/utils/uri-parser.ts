import { ApplicationError, ErrorCode } from './error-handling.js';
import { validateResourceType, ResourceType, SUPPORTED_RESOURCE_TYPES } from '../config/resource-types.js';

/**
 * Represents a parsed resource URI with its components.
 * Resource URIs follow the format: resource:///{type}/{id}
 * 
 * @example
 * // Valid URI: resource:///block/my-block-123
 * const parsed: ParsedResourceUri = {
 *   type: 'block',
 *   id: 'my-block-123'
 * };
 */
export interface ParsedResourceUri {
  /** The type of resource (e.g., 'block') */
  type: ResourceType;
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
 * ([^\/\?\#]*)         - Capture group 2 (id): Zero or more chars that aren't /, ?, or #
 * $                     - End of string
 */
const RESOURCE_URI_PATTERN = /^resource:\/\/\/([a-zA-Z0-9_]+)\/([^\/\?\#]*)$/;

/**
 * Regular expression for validating resource IDs.
 * 
 * Pattern requirements:
 * - Must start with an alphanumeric character
 * - Can contain hyphens for readability
 * - Must be between 1 and 128 characters
 * - Cannot end with a hyphen
 * - Cannot contain consecutive hyphens
 */
const RESOURCE_ID_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|(?!--)[-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

/**
 * Error thrown when URI parsing or creation fails.
 * This error extends ApplicationError to maintain consistent error handling.
 * 
 * @example
 * try {
 *   parseResourceUri('invalid://uri');
 * } catch (error) {
 *   if (error instanceof ResourceUriError) {
 *     console.error(error.message); // Provides detailed error information
 *   }
 * }
 */
export class ResourceUriError extends ApplicationError {
  constructor(
    message: string,
    code: ErrorCode = 'INVALID_RESOURCE_ID'
  ) {
    super(message, code, 'ResourceUriError');
  }
}

/**
 * Parses a resource URI into its components.
 * The URI must follow the format: resource:///{type}/{id}
 * 
 * Validation rules:
 * - Must match the resource URI format exactly
 * - Type must be a supported resource type (currently: ${Array.from(SUPPORTED_RESOURCE_TYPES).join(', ')})
 * - ID must be alphanumeric with optional hyphens, 1-128 chars
 * - ID cannot start or end with a hyphen
 * - ID cannot contain consecutive hyphens
 * 
 * @example
 * // Parse a valid resource URI
 * const { type, id } = parseResourceUri('resource:///block/my-block-123');
 * 
 * // Will throw for invalid URIs
 * try {
 *   parseResourceUri('invalid://uri');
 * } catch (error) {
 *   // Handle the error
 * }
 * 
 * @param uri - The resource URI to parse
 * @returns The parsed URI components
 * @throws {ResourceUriError} If the URI format is invalid or contains invalid components
 */
export function parseResourceUri(uri: string): ParsedResourceUri {
  // Input validation
  if (!uri || typeof uri !== 'string') {
    throw new ResourceUriError(
      'Invalid resource URI format'
    );
  }

  // URI format validation
  const match = uri.match(RESOURCE_URI_PATTERN);
  if (!match || match.length < 3) {
    throw new ResourceUriError(
      'Invalid resource URI format'
    );
  }

  const [, type, id] = match;

  // Resource type validation
  if (!validateResourceType(type)) {
    throw new ResourceUriError(
      `Unsupported resource type: ${type}`,
      'INVALID_RESOURCE_TYPE'
    );
  }

  // Resource ID validation
  if (!id || !RESOURCE_ID_PATTERN.test(id) || id.length > 128) {
    throw new ResourceUriError(
      'Invalid resource ID format'
    );
  }

  return { type: type as ResourceType, id };
}

/**
 * Creates a resource URI from its components.
 * This is the inverse operation of parseResourceUri.
 * 
 * Validation rules:
 * - Type must be a supported resource type (currently: ${Array.from(SUPPORTED_RESOURCE_TYPES).join(', ')})
 * - ID must be alphanumeric with optional hyphens, 1-128 chars
 * - ID cannot start or end with a hyphen
 * - ID cannot contain consecutive hyphens
 * 
 * @example
 * // Create a valid resource URI
 * const uri = createResourceUri('block', 'my-block-123');
 * // Result: 'resource:///block/my-block-123'
 * 
 * // Will throw for invalid components
 * try {
 *   createResourceUri('invalid-type', '!!!');
 * } catch (error) {
 *   // Handle the error
 * }
 * 
 * @param type - The resource type (e.g., "block")
 * @param id - The resource ID
 * @returns The formatted URI
 * @throws {ResourceUriError} If the components are invalid
 */
export function createResourceUri(type: ResourceType, id: string): string {
  // Input validation
  if (!type || typeof type !== 'string') {
    throw new ResourceUriError(
      'Invalid resource type',
      'INVALID_RESOURCE_TYPE'
    );
  }

  if (!id || typeof id !== 'string') {
    throw new ResourceUriError(
      'Invalid resource ID format'
    );
  }

  // Resource type validation
  if (!validateResourceType(type)) {
    throw new ResourceUriError(
      `Unsupported resource type: ${type}`,
      'INVALID_RESOURCE_TYPE'
    );
  }

  // Resource ID validation
  if (!RESOURCE_ID_PATTERN.test(id) || id.length > 128) {
    throw new ResourceUriError(
      'Invalid resource ID format'
    );
  }

  return `resource:///${type}/${id}`;
}