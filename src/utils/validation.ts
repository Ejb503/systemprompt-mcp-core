import { ApplicationError, ErrorCode } from './error-handling.js';
import type { ResourceCallRequest } from '../handlers/resource-handlers.js';

/**
 * Error thrown when request validation fails.
 * This error extends ApplicationError to maintain consistent error handling across the application.
 * 
 * @example
 * ```ts
 * throw new ValidationError('Request uri cannot be empty', 'INVALID_REQUEST');
 * ```
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, code: Extract<ErrorCode, 'VALIDATION_ERROR' | 'INVALID_REQUEST'> = 'VALIDATION_ERROR') {
    super(message, code, 'ValidationError');
  }
}

/**
 * Type guard to check if a value is a non-null object.
 * This is useful for validating request bodies and parameters.
 * 
 * @param value - The value to check
 * @returns True if the value is a non-null object, false otherwise
 * 
 * @example
 * ```ts
 * if (isObject(request)) {
 *   // request is now typed as Record<string, unknown>
 *   const params = request.params;
 * }
 * ```
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if an object has a specific property.
 * This is useful for narrowing types and ensuring required fields exist.
 * 
 * @param obj - The object to check
 * @param prop - The property name to look for
 * @returns True if the object has the specified property, false otherwise
 * 
 * @example
 * ```ts
 * if (hasProperty(params, 'uri')) {
 *   // params.uri is now typed as unknown
 *   const uri = params.uri;
 * }
 * ```
 */
function hasProperty<K extends string>(obj: object, prop: K): obj is { [P in K]: unknown } {
  return prop in obj;
}

/**
 * Validates that a value is a non-empty string.
 * Trims the string before checking length to ensure it's not just whitespace.
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated (used in error messages)
 * @throws {ValidationError} If the value is not a string or is empty after trimming
 * 
 * @example
 * ```ts
 * // Throws if uri is not a string or is empty
 * validateNonEmptyString(params.uri, 'Request uri');
 * // uri is now typed as string
 * ```
 */
function validateNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates that a value is an object with the specified property.
 * This combines object validation with property checking in a type-safe way.
 * 
 * @param value - The value to validate
 * @param prop - The required property name
 * @param objectName - The name of the object being validated (used in error messages)
 * @throws {ValidationError} If the value is not an object or lacks the required property
 * 
 * @example
 * ```ts
 * // Validates request has params property
 * validateObjectWithProperty(request, 'params', 'Request');
 * // request.params is now typed as unknown
 * ```
 */
function validateObjectWithProperty<K extends string>(
  value: unknown,
  prop: K,
  objectName: string
): asserts value is { [P in K]: unknown } {
  if (!isObject(value)) {
    throw new ValidationError(`${objectName} must be an object`);
  }
  if (!hasProperty(value, prop)) {
    throw new ValidationError(`${objectName} must contain ${prop}`);
  }
}

/**
 * Validates a resource call request structure.
 * Ensures the request has the correct shape and required fields.
 * 
 * The request must have:
 * - A 'params' object property
 * - A 'uri' string property within params
 * - A non-empty uri value
 * 
 * @param request - The request to validate
 * @throws {ValidationError} If any validation step fails
 * 
 * @example
 * ```ts
 * // Valid request
 * validateResourceCallRequest({
 *   params: { uri: 'resource:///block/123' }
 * });
 * 
 * // Invalid request - throws ValidationError
 * validateResourceCallRequest({
 *   params: { uri: '' }
 * });
 * ```
 */
export function validateResourceCallRequest(request: unknown): asserts request is ResourceCallRequest {
  // Validate request object and params property
  validateObjectWithProperty(request, 'params', 'Request');
  
  // Validate params object and uri property
  validateObjectWithProperty(request.params, 'uri', 'Request params');
  
  // Validate uri is a non-empty string
  validateNonEmptyString(request.params.uri, 'Request uri');
}

/**
 * Type guard for checking if a value is a non-empty string.
 * Unlike validateNonEmptyString, this function returns a boolean instead of throwing.
 * 
 * @param value - The value to check
 * @returns True if the value is a non-empty string after trimming, false otherwise
 * 
 * @example
 * ```ts
 * if (isNonEmptyString(params.uri)) {
 *   // params.uri is now typed as string
 *   const uri = params.uri;
 * }
 * ```
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
} 