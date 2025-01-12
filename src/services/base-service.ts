import { handleApiError, handleServiceError } from "../utils/error-handling.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export const HTTP_METHOD: Record<HttpMethod, HttpMethod> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

/**
 * Base service class for API communication
 * Provides common functionality for making HTTP requests
 */
export abstract class BaseService {
  protected apiKey: string;
  protected baseUrl: string;

  /**
   * Validates if a string is a valid URL
   * @param url - The URL to validate
   * @returns True if the URL is valid, false if it's a TypeError
   * @throws Other errors that aren't TypeError
   */
  private static isValidUrl(url: string): boolean {
    try {
      // Add protocol if missing to handle relative URLs
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      // Only accept URLs that start with http or https
      return url.startsWith('http://') || url.startsWith('https://');
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  }

  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    
    if (baseUrl && BaseService.isValidUrl(baseUrl)) {
      this.baseUrl = baseUrl;
    } else {
      console.warn("Invalid base URL provided. Falling back to default URL.");
      this.baseUrl = "https://api.systemprompt.io/v1";
    }
  }

  /**
   * Makes a request to the SystemPrompt API
   * @param endpoint - The API endpoint to call
   * @param method - The HTTP method to use
   * @param data - Optional data to send with the request
   * @returns Promise resolving to the typed response data
   * @throws {ServiceError} If the request fails
   * @throws {ApiError} If the API returns an error
   */
  protected async request<T>(method: typeof HTTP_METHOD[keyof typeof HTTP_METHOD], path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw handleServiceError(error, 'make API request');
    }

    if (!response.ok) {
      const data = await response.json();
      throw handleApiError({ message: data.message || data.error || 'Unknown error' });
    }

    try {
      return await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw handleServiceError(error, 'parse API response');
      }
      throw handleServiceError(new Error('Unknown error'), 'parse API response');
    }
  }
} 