/**
 * Base error code type for the application
 */
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'INVALID_REQUEST'
  | 'RESOURCE_NOT_FOUND'
  | 'INVALID_RESOURCE_TYPE'
  | 'INVALID_RESOURCE_ID'
  | 'SERVICE_ERROR'
  | 'API_ERROR'
  | 'PARSE_ERROR';

/**
 * Base class for all custom application errors
 */
export class ApplicationError extends Error {
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode, name = 'ApplicationError') {
    super(message);
    this.name = name;
    this.code = code;
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Creates a user-friendly error response
   */
  toResponse(): { error: { code: ErrorCode; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

/**
 * Error thrown when service operations fail
 */
export class ServiceError extends ApplicationError {
  constructor(message: string, operation: string) {
    super(
      `Operation failed: ${operation}. ${message}`,
      'SERVICE_ERROR',
      'ServiceError'
    );
  }
}

/**
 * Error thrown when API responses indicate failure
 */
export class ApiError extends ApplicationError {
  constructor(message: string) {
    super(
      `API request failed: ${message}`,
      'API_ERROR',
      'ApiError'
    );
  }
}

/**
 * Error thrown when parsing operations fail
 */
export class ParseError extends ApplicationError {
  constructor(message: string) {
    super(
      `Parse error: ${message}`,
      'PARSE_ERROR',
      'ParseError'
    );
  }
}

/**
 * Handles errors from service operations by wrapping them in a standardized format
 * @param error The caught error
 * @param context Description of what operation failed
 * @throws ServiceError with standardized message format
 */
export const handleServiceError = (error: unknown, context: string): never => {
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new ServiceError(message, context);
};

/**
 * Handles errors from API responses
 * @param response The API response data
 * @param defaultMessage Default message if response doesn't contain one
 * @throws ApiError with the API error message or default message
 */
export const handleApiError = (
  response: { message?: string },
  defaultMessage: string = "API request failed"
): never => {
  throw new ApiError(response.message || defaultMessage);
}; 