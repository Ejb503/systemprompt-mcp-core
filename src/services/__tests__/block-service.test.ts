import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BlockService } from '../block-service.js';
import { ServiceError, ApiError } from '../../utils/error-handling.js';
import type { Block, BlockCreationResult, CreateBlockInput, EditBlockInput } from '../../types/index.js';

// Mock global fetch
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

describe('BlockService', () => {
  const mockApiKey = 'test-api-key';
  const defaultBaseUrl = 'https://api.systemprompt.io/v1';
  let service: BlockService;

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

  const mockBlock: BlockCreationResult = {
    id: 'test-block-id',
    content: 'test content',
    prefix: 'test_prefix',
    metadata: {
      title: 'test block',
      description: 'test description',
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
    service = new BlockService(mockApiKey, defaultBaseUrl);
  });

  describe('listBlocks', () => {
    const mockBlocks: Block[] = [{
      id: 'test-block-id',
      name: 'Test Block',
      description: 'Test description',
      type: 'text',
      content: 'test content'
    }];

    it('should list blocks successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockBlocks));

      const result = await service.listBlocks();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/blocks`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }
        })
      );
      expect(result).toEqual(mockBlocks);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.listBlocks()).rejects.toThrow(ServiceError);
      await expect(service.listBlocks()).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Unauthorized' })));

      await expect(service.listBlocks()).rejects.toThrow(ApiError);
      await expect(service.listBlocks()).rejects.toThrow('API request failed: Unauthorized');
    });
  });

  describe('getBlock', () => {
    it('should fetch block successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockBlock));

      const result = await service.getBlock('test-block-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/blocks/test-block-id`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }
        })
      );
      expect(result).toEqual(mockBlock);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.getBlock('test-block-id')).rejects.toThrow(ServiceError);
      await expect(service.getBlock('test-block-id')).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Block not found' })));

      await expect(service.getBlock('test-block-id')).rejects.toThrow(ApiError);
      await expect(service.getBlock('test-block-id')).rejects.toThrow('API request failed: Block not found');
    });
  });

  describe('createBlock', () => {
    const createBlockInput: CreateBlockInput = {
      content: 'test content',
      prefix: 'test_prefix',
      metadata: {
        title: 'test block',
        description: 'test description'
      }
    };

    it('should create block successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockBlock));

      const result = await service.createBlock(createBlockInput);

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/blocks`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          },
          body: JSON.stringify(createBlockInput)
        })
      );
      expect(result).toEqual(mockBlock);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.createBlock(createBlockInput)).rejects.toThrow(ServiceError);
      await expect(service.createBlock(createBlockInput)).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Invalid block data' })));

      await expect(service.createBlock(createBlockInput)).rejects.toThrow(ApiError);
      await expect(service.createBlock(createBlockInput)).rejects.toThrow('API request failed: Invalid block data');
    });
  });

  describe('editBlock', () => {
    const editBlockInput: EditBlockInput = {
      uuid: 'test-block-id',
      content: 'updated content',
      prefix: 'updated_prefix',
      metadata: {
        title: 'updated block',
        description: 'updated description'
      }
    };

    it('should edit block successfully', async () => {
      const updatedBlock = { ...mockBlock, ...editBlockInput };
      mockFetch.mockResolvedValueOnce(createMockResponse(true, updatedBlock));

      const result = await service.editBlock('test-block-id', editBlockInput);

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultBaseUrl}/blocks/test-block-id`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          },
          body: JSON.stringify(editBlockInput)
        })
      );
      expect(result).toEqual(updatedBlock);
    });

    it('should throw ServiceError on network failure', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

      await expect(service.editBlock('test-block-id', editBlockInput)).rejects.toThrow(ServiceError);
      await expect(service.editBlock('test-block-id', editBlockInput)).rejects.toThrow('Operation failed: make API request');
    });

    it('should throw ApiError on API error response', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse(false, { message: 'Block not found' })));

      await expect(service.editBlock('test-block-id', editBlockInput)).rejects.toThrow(ApiError);
      await expect(service.editBlock('test-block-id', editBlockInput)).rejects.toThrow('API request failed: Block not found');
    });
  });
}); 