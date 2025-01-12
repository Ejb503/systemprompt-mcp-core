import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { BaseService, HttpMethod } from '../base-service.js';
import { ApiError, ServiceError } from '../../utils/error-handling.js';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

class TestService extends BaseService {
  public testRequest(method: HttpMethod, path: string = '/test', body?: unknown) {
    return this.request(method, path, body);
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestService('test-api-key');
  });

  describe('request', () => {
    beforeEach(() => {
      global.fetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
    });

    it('should handle API errors with missing error message', async () => {
      const mockResponse = new Response('{}', { status: 400 });
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      try {
        await service.testRequest('GET' as HttpMethod, '/test');
        throw new Error('Expected error to be thrown');
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw new Error('Expected ApiError');
        }
        expect(error.message).toBe('API request failed: Unknown error');
      }
    });

    it('should handle parse errors with cause', async () => {
      const mockResponse = new Response('invalid json', { status: 200 });
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      try {
        await service.testRequest('GET' as HttpMethod, '/test');
        throw new Error('Expected error to be thrown');
      } catch (error) {
        if (!(error instanceof ServiceError)) {
          throw new Error('Expected ServiceError');
        }
        expect(error.message).toBe('Operation failed: parse API response. Unknown error');
        expect(error.cause).toBeInstanceOf(Error);
      }
    });
  });
}); 