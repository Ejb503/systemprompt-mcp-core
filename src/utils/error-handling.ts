/**
 * Base error code type for the application.
 * These codes are used to categorize different types of errors that can occur
 * throughout the application for consistent error handling and reporting.
 */
export type ErrorCode = 
  | 'VALIDATION_ERROR'   // Input validation failures
  | 'INVALID_REQUEST'    // Malformed or invalid request parameters
  | 'RESOURCE_NOT_FOUND' // Requested resource doesn't exist
  | 'INVALID_RESOURCE_TYPE' // Resource type doesn't match expected type
  | 'INVALID_RESOURCE_ID'   // Resource ID is invalid or malformed
  | 'SERVICE_ERROR'      // Internal service operation failures
  | 'API_ERROR'          // External API communication failures
  | 'PARSE_ERROR';       // Data parsing/transformation failures

/**
 * Base class for all custom application errors.
 * Provides a consistent error structure with code and message formatting.
 * 
 * @example
 * ```typescript
 * throw new ApplicationError('Invalid input provided', 'VALIDATION_ERROR');
 * ```
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
   * Creates a user-friendly error response object suitable for API responses.
   * 
   * @returns An object containing the error code and message
   * 
   * @example
   * ```typescript
   * const error = new ApplicationError('Invalid input', 'VALIDATION_ERROR');
   * const response = error.toResponse();
   * // Returns: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }
   * ```
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
 * Error thrown when service operations fail.
 * Used to wrap internal service errors with additional context about the failed operation.
 * 
 * @example
 * ```typescript
 * try {
 *   await userService.createUser(userData);
 * } catch (error) {
 *   throw new ServiceError('Failed to create user', 'createUser', error);
 * }
 * ```
 */
export class ServiceError extends ApplicationError {
  readonly cause?: Error;

  constructor(message: string, operation: string, originalError?: Error) {
    super(
      `Operation failed: ${operation}. ${message}`,
      'SERVICE_ERROR',
      'ServiceError'
    );
    this.cause = originalError;
  }

  /**
   * Gets the original error that caused this service error.
   * Useful for debugging and logging purposes.
   * 
   * @returns The original error if available, undefined otherwise
   */
  getCause(): Error | undefined {
    return this.cause;
  }
}

/**
 * Error thrown when API responses indicate failure.
 * Used to standardize error handling for external API communication issues.
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await externalApi.getData();
 *   if (!response.ok) {
 *     throw new ApiError('Failed to fetch data from external API');
 *   }
 * } catch (error) {
 *   // Handle API error
 * }
 * ```
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
 * Error thrown when parsing operations fail.
 * Used when data transformation or parsing operations encounter issues.
 * 
 * @example
 * ```typescript
 * try {
 *   const data = JSON.parse(invalidJson);
 * } catch {
 *   throw new ParseError('Invalid JSON format');
 * }
 * ```
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
 * Handles errors from service operations by wrapping them in a standardized format.
 * This utility ensures consistent error handling across service operations.
 * 
 * @param error - The caught error from the service operation
 * @param context - Description of what operation failed
 * @throws ServiceError with standardized message format and original error
 * 
 * @example
 * ```typescript
 * async function createUser(userData: UserData) {
 *   try {
 *     await database.insert(userData);
 *   } catch (error) {
 *     handleServiceError(error, 'Creating new user');
 *   }
 * }
 * ```
 */
export const handleServiceError = (error: unknown, context: string): never => {
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new ServiceError(message, context, error instanceof Error ? error : undefined);
};

/**
 * Handles errors from API responses by converting them to standardized ApiError instances.
 * Ensures consistent error handling for failed API requests.
 * 
 * @param response - The API response data containing error information
 * @param defaultMessage - Default message if response doesn't contain one
 * @throws ApiError with the API error message or default message
 * 
 * @example
 * ```typescript
 * async function fetchUserData(userId: string) {
 *   const response = await api.get(`/users/${userId}`);
 *   if (!response.ok) {
 *     handleApiError(response.data, 'Failed to fetch user data');
 *   }
 *   return response.data;
 * }
 * ```
 */
export const handleApiError = (
  response: { message?: string; error?: string },
  defaultMessage: string = "API request failed"
): never => {
  throw new ApiError(response.message || response.error || defaultMessage);
}; 