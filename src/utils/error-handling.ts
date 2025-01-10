/**
 * Handles errors from service operations by wrapping them in a standardized format
 * @param error The caught error
 * @param context Description of what operation failed
 * @throws Error with standardized message format
 */
export const handleServiceError = (error: unknown, context: string): never => {
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new Error(`Failed to ${context}: ${message}`);
};

/**
 * Handles errors from API responses
 * @param response The API response data
 * @param defaultMessage Default message if response doesn't contain one
 * @throws Error with the API error message or default message
 */
export const handleApiError = (response: { message?: string }, defaultMessage: string = "API request failed"): never => {
  throw new Error(response.message || defaultMessage);
}; 