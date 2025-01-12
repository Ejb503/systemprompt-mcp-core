import type { Block, BlockCreationResult } from "../types/index.js";
import { createResourceUri } from "./uri-parser.js";

/**
 * Base interface for all resources
 */
export interface BaseResource {
  uri: string;
  mimeType: string;
  name: string;
}

/**
 * Interface for resources that can have descriptions
 */
export interface DescribableResource extends BaseResource {
  description: string;
}

/**
 * Interface for block-specific resource fields
 */
export interface BlockResource extends DescribableResource {
  type: 'block';
  blockType: Block['type'];
}

/**
 * Interface for resource content responses
 */
export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Maps a block to a resource representation
 */
export function mapBlockToResource(block: Block): BlockResource {
  return {
    uri: createResourceUri('block', block.id),
    mimeType: "text/plain",
    name: block.name,
    description: block.description || `${block.type} block: ${block.name}`,
    type: 'block',
    blockType: block.type,
  };
}

/**
 * Maps a block to a resource content representation
 */
export function mapBlockToContent(block: BlockCreationResult, uri: string): ResourceContent {
  return {
    uri,
    mimeType: "text/plain",
    text: block.content,
  };
}

/**
 * Maps a list of blocks to resource representations
 */
export function mapBlocksToResources(blocks: Block[]): BlockResource[] {
  return blocks.map(mapBlockToResource);
} 