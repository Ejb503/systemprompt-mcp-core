import { ApplicationError, ErrorCode } from './error-handling.js';
import type { ResourceCallRequest } from '../types/index.js';
import { parseResourceUri, ResourceUriError } from './uri-parser.js';

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
  constructor(
    message: string,
    code: Extract<ErrorCode, 'VALIDATION_ERROR' | 'INVALID_REQUEST'> = 'VALIDATION_ERROR',
    name: string = 'ValidationError'
  ) {
    super(message, code, name);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Type guard to check if a value is a non-null object.
 * This is useful for validating request bodies and parameters.
 * 
 * @param value - The value to check
 * @returns True if the value is a non-null object and not an array, false otherwise
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
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
 * Validates that a value is an object.
 * 
 * @param value - The value to validate
 * @param objectName - The name of the object being validated (used in error messages)
 * @throws {ValidationError} If the value is not an object
 * 
 * @example
 * ```ts
 * validateObject(request, 'Request');
 * // request is now typed as Record<string, unknown>
 * ```
 */
function validateObject(value: unknown, objectName: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new ValidationError(`${objectName} must be an object`);
  }
}

/**
 * Validates that an object has the specified property.
 * Assumes the input has already been validated as an object.
 * 
 * @param obj - The object to validate
 * @param prop - The required property name
 * @param objectName - The name of the object being validated (used in error messages)
 * @throws {ValidationError} If the object lacks the required property
 * 
 * @example
 * ```ts
 * validateObjectProperty(request, 'params', 'Request');
 * // request.params is now typed as unknown
 * ```
 */
function validateObjectProperty<K extends string>(
  obj: Record<string, unknown>,
  prop: K,
  objectName: string
): asserts obj is Record<string, unknown> & { [P in K]: unknown } {
  if (!hasProperty(obj, prop)) {
    throw new ValidationError(`${objectName} must contain ${prop}`);
  }
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
 * Validates a resource call request structure.
 * Ensures the request has the correct shape and required fields.
 * 
 * The request must have:
 * - A 'params' object property
 * - A 'uri' string property within params
 * - A non-empty uri value that matches the resource URI format
 * 
 * Validation order:
 * 1. Request is an object
 * 2. Request has params property
 * 3. Params is an object
 * 4. Params has uri property
 * 5. Uri is a non-empty string
 * 6. Uri matches the resource URI format
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
  // First validate that request is an object
  validateObject(request, 'Request');

  // Then validate it has the params property
  validateObjectProperty(request, 'params', 'Request');

  // Then validate that params is an object
  validateObject(request.params, 'Request params');

  // Then validate it has the uri property
  validateObjectProperty(request.params, 'uri', 'Request params');

  // Then validate the uri value is a non-empty string
  validateNonEmptyString(request.params.uri, 'Request uri');

  // Finally validate the uri format
  try {
    parseResourceUri(request.params.uri);
  } catch (error) {
    if (error instanceof ResourceUriError) {
      throw new ValidationError('Request uri has invalid format', 'VALIDATION_ERROR');
    }
    throw error;
  }
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