import { BaseService, HTTP_METHOD } from "./base-service.js";
import {
  Block,
  BlockCreationResult,
  CreateBlockInput,
  EditBlockInput,
} from "../types/index.js";

export class BlockService extends BaseService {
  /**
   * List all blocks
   * @returns {Promise<Block[]>} List of blocks
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async listBlocks(): Promise<Block[]> {
    return this.request<Block[]>(HTTP_METHOD.GET, "/blocks");
  }

  /**
   * Get a block by ID
   * @param {string} blockId The ID of the block to get
   * @returns {Promise<Block>} The block
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async getBlock(blockId: string): Promise<Block> {
    return this.request<Block>(HTTP_METHOD.GET, `/blocks/${blockId}`);
  }

  /**
   * Create a new block
   * @param {CreateBlockInput} data The block data
   * @returns {Promise<BlockCreationResult>} The created block
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async createBlock(data: CreateBlockInput): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>(HTTP_METHOD.POST, "/blocks", data);
  }

  /**
   * Edit an existing block
   * @param {string} blockId The ID of the block to edit
   * @param {EditBlockInput} data The updated block data
   * @returns {Promise<BlockCreationResult>} The updated block
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async editBlock(
    blockId: string,
    data: EditBlockInput
  ): Promise<BlockCreationResult> {
    return this.request<BlockCreationResult>(
      HTTP_METHOD.PUT,
      `/blocks/${blockId}`,
      data
    );
  }
} 