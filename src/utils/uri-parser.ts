/**
 * Represents a parsed resource URI
 */
export interface ParsedResourceUri {
  type: string;
  id: string;
}

/**
 * Error thrown when URI parsing fails
 */
export class ResourceUriError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceUriError';
  }
}

/**
 * Parses a resource URI into its components
 * @param uri The resource URI to parse (e.g., "resource:///block/123")
 * @returns The parsed URI components
 * @throws {ResourceUriError} If the URI format is invalid
 */
export function parseResourceUri(uri: string): ParsedResourceUri {
  const match = uri.match(/^resource:\/\/\/([^/]+)\/(.+)$/);

  if (!match) {
    throw new ResourceUriError(
      'Invalid resource URI format - expected "resource:///{type}/{id}"'
    );
  }

  const [, type, id] = match;

  // Validate resource type
  if (!isValidResourceType(type)) {
    throw new ResourceUriError(`Unsupported resource type: ${type}`);
  }

  // Validate ID format (non-empty, no slashes)
  if (!id || id.includes('/')) {
    throw new ResourceUriError('Invalid resource ID format');
  }

  return { type, id };
}

/**
 * Creates a resource URI from components
 * @param type The resource type (e.g., "block")
 * @param id The resource ID
 * @returns The formatted URI
 * @throws {ResourceUriError} If the components are invalid
 */
export function createResourceUri(type: string, id: string): string {
  if (!isValidResourceType(type)) {
    throw new ResourceUriError(`Unsupported resource type: ${type}`);
  }

  if (!id || id.includes('/')) {
    throw new ResourceUriError('Invalid resource ID format');
  }

  return `resource:///${type}/${id}`;
}

/**
 * Checks if a resource type is supported
 */
function isValidResourceType(type: string): boolean {
  // Add new resource types here as they are supported
  const validTypes = ['block'];
  return validTypes.includes(type);
} 