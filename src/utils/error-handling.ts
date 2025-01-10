/**
 * Base class for all custom application errors
 */
export class ApplicationError extends Error {
  constructor(message: string, name: string = 'ApplicationError') {
    super(message);
    this.name = name;
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Handles errors from service operations by wrapping them in a standardized format
 * @param error The caught error
 * @param context Description of what operation failed
 * @throws Error with standardized message format
 */
export const handleServiceError = (error: unknown, context: string): never => {
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new ApplicationError(`Failed to ${context}: ${message}`, 'ServiceError');
};

/**
 * Handles errors from API responses
 * @param response The API response data
 * @param defaultMessage Default message if response doesn't contain one
 * @throws Error with the API error message or default message
 */
export const handleApiError = (response: { message?: string }, defaultMessage: string = "API request failed"): never => {
  throw new ApplicationError(response.message || defaultMessage, 'ApiError');
}; 