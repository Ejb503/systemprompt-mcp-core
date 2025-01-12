import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PromptService } from '../prompt-service.js';
import { ServiceError, ApiError } from '../../utils/error-handling.js';
import type { PromptCreationResult, CreatePromptInput, EditPromptInput } from '../../types/index.js';

// Mock global fetch
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

describe('PromptService', () => {
  const mockApiKey = 'test-api-key';
  const defaultBaseUrl = 'https://api.systemprompt.io/v1';
  let service: PromptService;

  // Helper to create mock responses
  const createMockResponse = (ok: boolean, data: unknown): Response => ({
    ok,
    json: () => Promise.resolve(data),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve('')
  } as Response);

  const mockPrompt: PromptCreationResult = {
    id: 'test-id',
    instruction: {
      static: 'test instruction',
      state: 'test state',
      dynamic: 'test dynamic'
    },
    input: {
      name: 'test input',
      description: 'test description',
      type: ['message']
    },
    output: {
      name: 'test output',
      description: 'test description',
      type: ['message']
    },
    metadata: {
      title: 'test title',
      description: 'test description',
      tag: ['test'],
      created: '2024-01-01',
      updated: '2024-01-01',
      version: 1,
      status: 'draft',
      author: 'test',
      log_message: 'test message'
    },
    _link: 'test-link'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PromptService(mockApiKey, defaultBaseUrl);
  });

  describe('getAllPrompts', () => {
    it('should fetch prompts successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, [mockPrompt]));

      const result = await service.getAllPrompts();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/prompts`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }
        })
      );
      expect(result).toEqual([mockPrompt]);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.getAllPrompts()).rejects.toThrow(ServiceError);
      await expect(service.getAllPrompts()).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Invalid request' })));

      await expect(service.getAllPrompts()).rejects.toThrow(ApiError);
      await expect(service.getAllPrompts()).rejects.toThrow('API request failed: Invalid request');
    });
  });

  describe('createPrompt', () => {
    const createPromptInput: CreatePromptInput = {
      instruction: {
        static: 'test instruction',
        state: 'test state',
        dynamic: 'test dynamic'
      },
      input: {
        name: 'test input',
        description: 'test description',
        type: ['message' as const]
      },
      output: {
        name: 'test output',
        description: 'test description',
        type: ['message' as const]
      },
      metadata: {
        title: 'test title',
        description: 'test description'
      }
    };

    it('should create prompt successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockPrompt));

      const result = await service.createPrompt(createPromptInput);

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/prompts`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          },
          body: JSON.stringify(createPromptInput)
        })
      );
      expect(result).toEqual(mockPrompt);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.createPrompt(createPromptInput)).rejects.toThrow(ServiceError);
      await expect(service.createPrompt(createPromptInput)).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Invalid prompt data' })));

      await expect(service.createPrompt(createPromptInput)).rejects.toThrow(ApiError);
      await expect(service.createPrompt(createPromptInput)).rejects.toThrow('API request failed: Invalid prompt data');
    });
  });

  describe('editPrompt', () => {
    const editPromptInput: EditPromptInput = {
      uuid: 'test-id',
      instruction: {
        static: 'updated instruction',
        state: 'updated state',
        dynamic: 'updated dynamic'
      },
      metadata: {
        title: 'updated title',
        description: 'updated description'
      }
    };

    it('should edit prompt successfully', async () => {
      const updatedPrompt = { ...mockPrompt, ...editPromptInput };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, updatedPrompt));

      const result = await service.editPrompt('test-id', editPromptInput);

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/prompts/test-id`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          },
          body: JSON.stringify(editPromptInput)
        })
      );
      expect(result).toEqual(updatedPrompt);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.editPrompt('test-id', editPromptInput)).rejects.toThrow(ServiceError);
      await expect(service.editPrompt('test-id', editPromptInput)).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Prompt not found' })));

      await expect(service.editPrompt('test-id', editPromptInput)).rejects.toThrow(ApiError);
      await expect(service.editPrompt('test-id', editPromptInput)).rejects.toThrow('API request failed: Prompt not found');
    });
  });
}); 