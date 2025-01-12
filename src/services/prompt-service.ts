import { BaseService, HTTP_METHOD } from "./base-service.js";
import {
  CreatePromptInput,
  EditPromptInput,
  PromptCreationResult,
} from "../types/index.js";

/**
 * Service class for managing prompts through the SystemPrompt API
 */
export class PromptService extends BaseService {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
  }

  /**
   * Get all prompts
   * @returns {Promise<PromptCreationResult[]>} List of prompts
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async getAllPrompts(): Promise<PromptCreationResult[]> {
    return this.request<PromptCreationResult[]>(HTTP_METHOD.GET, "/prompts");
  }

  /**
   * Create a new prompt
   * @param {CreatePromptInput} data The prompt data
   * @returns {Promise<PromptCreationResult>} The created prompt
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async createPrompt(data: CreatePromptInput): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(HTTP_METHOD.POST, "/prompts", data);
  }

  /**
   * Edit an existing prompt
   * @param {string} promptId The ID of the prompt to edit
   * @param {EditPromptInput} data The updated prompt data
   * @returns {Promise<PromptCreationResult>} The updated prompt
   * @throws {ServiceError} If there is a network error
   * @throws {ApiError} If the API returns an error
   */
  async editPrompt(
    promptId: string,
    data: EditPromptInput
  ): Promise<PromptCreationResult> {
    return this.request<PromptCreationResult>(
      HTTP_METHOD.PUT,
      `/prompts/${promptId}`,
      data
    );
  }
} 