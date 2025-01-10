import { ApplicationError } from './error-handling.js';
import type { ResourceCallRequest } from '../handlers/resource-handlers.js';

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 'ValidationError');
  }
}

/**
 * Type guard to check if a value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if an object has a specific property
 */
function hasProperty<K extends string>(obj: object, prop: K): obj is { [P in K]: unknown } {
  return prop in obj;
}

/**
 * Validates that a value is a non-empty string
 * @throws {ValidationError} If the value is not a non-empty string
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
 * Validates that a value is an object with the specified property
 * @throws {ValidationError} If the value is not an object or lacks the required property
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
 * Validates a resource call request
 * @throws {ValidationError} If the request is invalid
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
 * Type guard for checking if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
} 