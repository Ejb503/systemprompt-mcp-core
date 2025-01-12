import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseService, HTTP_METHOD } from '../base-service.js';
import { ServiceError, ApiError, handleServiceError, handleApiError } from '@/utils/error-handling.js';

// Create a concrete implementation for testing
class TestService extends BaseService {
  public async testRequest<T>(method: keyof typeof HTTP_METHOD, path: string, body?: unknown): Promise<T> {
    return this.request(HTTP_METHOD[method], path, body);
  }
}

describe('BaseService', () => {
  const mockApiKey = 'test-api-key';
  const defaultBaseUrl = 'https://api.systemprompt.io/v1';
  let service: TestService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new TestService(mockApiKey);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new TestService('')).toThrow('API key is required');
    });

    it('should use default base URL if none provided', () => {
      const service = new TestService(mockApiKey);
      expect((service as any).baseUrl).toBe(defaultBaseUrl);
    });

    it('should use provided base URL if valid', () => {
      const customUrl = 'https://custom.api.com';
      const service = new TestService(mockApiKey, customUrl);
      expect((service as any).baseUrl).toBe(customUrl);
    });

    it('should fall back to default URL if provided URL is invalid', () => {
      const invalidUrl = 'not-a-url';
      const service = new TestService(mockApiKey, invalidUrl);
      expect((service as any).baseUrl).toBe(defaultBaseUrl);
    });
  });

  describe('request', () => {
    it('should make successful request', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn(() => Promise.resolve(new Response(
        JSON.stringify(mockResponse),
        { status: 200 }
      ))) as typeof fetch;

      const result = await service.testRequest('GET', '/test');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/test`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle network errors with cause', async () => {
      const networkError = new Error('Network request failed');
      global.fetch = jest.fn(() => Promise.reject(networkError)) as typeof fetch;

      try {
        await service.testRequest('GET', '/test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error instanceof ServiceError).toBe(true);
        if (error instanceof ServiceError) {
          expect(error.message).toBe('Operation failed: make API request. Network request failed');
          expect(error.getCause()).toBe(networkError);
        }
      }
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn(() => Promise.resolve(new Response(
        JSON.stringify({ message: 'Invalid request' }),
        { status: 400 }
      ))) as typeof fetch;

      try {
        await service.testRequest('GET', '/test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.message).toBe('API request failed: Invalid request');
        }
      }
    });

    it('should handle API errors with missing error message', async () => {
      const mockResponse = new Response('{}', { status: 400 });
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockResponse));

      try {
        await service.testRequest('GET', '/test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.message).toBe('API request failed: Unknown error');
        }
      }
    });

    it('should handle parse errors with cause', async () => {
      const mockResponse = new Response('', { status: 200 });
      Object.defineProperty(mockResponse, 'json', {
        value: () => Promise.reject(new SyntaxError('Invalid JSON'))
      });
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockResponse));

      try {
        await service.testRequest('GET', '/test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error instanceof ServiceError).toBe(true);
        if (error instanceof ServiceError) {
          expect(error.message).toBe('Operation failed: parse API response. Invalid JSON');
          expect(error.getCause()).toBeInstanceOf(SyntaxError);
        }
      }
    });

    it('should include request body for POST/PUT methods', async () => {
      const mockResponse = { data: 'test' };
      const requestBody = { test: 'data' };
      global.fetch = jest.fn(() => Promise.resolve(new Response(
        JSON.stringify(mockResponse),
        { status: 200 }
      ))) as typeof fetch;

      await service.testRequest('POST', '/test', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });
}); 