import { jest, describe, it, expect } from '@jest/globals';
import {
  ApplicationError,
  ServiceError,
  ApiError,
  ParseError,
  handleServiceError,
  handleApiError,
} from '../error-handling.js';

describe('Error Handling', () => {
  describe('ApplicationError', () => {
    it('should create error with correct properties', () => {
      const error = new ApplicationError('Test message', 'VALIDATION_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ApplicationError');
    });

    it('should create proper error response', () => {
      const error = new ApplicationError('Test message', 'VALIDATION_ERROR');
      const response = error.toResponse();
      expect(response).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Test message',
        },
      });
    });
  });

  describe('ServiceError', () => {
    it('should create error with operation context', () => {
      const error = new ServiceError('Test message', 'test operation');
      expect(error.message).toBe('Operation failed: test operation. Test message');
      expect(error.code).toBe('SERVICE_ERROR');
      expect(error.name).toBe('ServiceError');
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original error');
      const error = new ServiceError('Test message', 'test operation', originalError);
      expect(error.getCause()).toBe(originalError);
    });

    it('should handle undefined original error', () => {
      const error = new ServiceError('Test message', 'test operation');
      expect(error.getCause()).toBeUndefined();
    });
  });

  describe('ApiError', () => {
    it('should create error with API context', () => {
      const error = new ApiError('Test message');
      expect(error.message).toBe('API request failed: Test message');
      expect(error.code).toBe('API_ERROR');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('ParseError', () => {
    it('should create error with parse context', () => {
      const error = new ParseError('Test message');
      expect(error.message).toBe('Parse error: Test message');
      expect(error.code).toBe('PARSE_ERROR');
      expect(error.name).toBe('ParseError');
    });
  });

  describe('handleServiceError', () => {
    it('should wrap Error instance', () => {
      const originalError = new Error('Original error');
      expect(() => handleServiceError(originalError, 'test operation')).toThrow(ServiceError);
      try {
        handleServiceError(originalError, 'test operation');
      } catch (error) {
        expect(error instanceof ServiceError).toBe(true);
        expect((error as ServiceError).getCause()).toBe(originalError);
      }
    });

    it('should handle non-Error objects', () => {
      expect(() => handleServiceError('string error', 'test operation')).toThrow(ServiceError);
      try {
        handleServiceError('string error', 'test operation');
      } catch (error) {
        expect(error instanceof ServiceError).toBe(true);
        expect((error as ServiceError).getCause()).toBeUndefined();
      }
    });
  });

  describe('handleApiError', () => {
    it('should create ApiError with response message', () => {
      expect(() => handleApiError({ message: 'API error' })).toThrow(ApiError);
      try {
        handleApiError({ message: 'API error' });
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.message).toBe('API request failed: API error');
        } else {
          fail('Expected ApiError');
        }
      }
    });

    it('should use default message when response message is missing', () => {
      expect(() => handleApiError({}, 'Default message')).toThrow(ApiError);
      try {
        handleApiError({}, 'Default message');
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.message).toBe('API request failed: Default message');
        } else {
          fail('Expected ApiError');
        }
      }
    });
  });
}); 