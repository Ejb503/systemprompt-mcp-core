/**
 * Supported resource types in the system.
 * This configuration can be extended as new resource types are added.
 */
export const SUPPORTED_RESOURCE_TYPES = new Set(['block']);

/**
 * Type guard to check if a string is a valid supported resource type.
 * 
 * @param type - The resource type to validate
 * @returns True if the type is supported, false otherwise
 */
export function validateResourceType(type: string): boolean {
  return SUPPORTED_RESOURCE_TYPES.has(type);
}

/**
 * Type representing all possible resource types in the system.
 * This should be kept in sync with SUPPORTED_RESOURCE_TYPES.
 */
export type ResourceType = 'block'; 