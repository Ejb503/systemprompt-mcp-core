import type { Block } from "../types/index.js";
import { createResourceUri } from "./uri-parser.js";

export interface Resource {
  uri: string;
  mimeType: string;
  name: string;
  description: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Maps a block to a resource representation
 */
export function mapBlockToResource(block: Block): Resource {
  return {
    uri: createResourceUri('block', block.id),
    mimeType: "text/plain",
    name: block.name,
    description: block.description || `${block.type} block: ${block.name}`,
  };
}

/**
 * Maps a block to a resource content representation
 */
export function mapBlockToContent(block: Block, uri: string): ResourceContent {
  return {
    uri,
    mimeType: "text/plain",
    text: block.content,
  };
}

/**
 * Maps a list of blocks to resource representations
 */
export function mapBlocksToResources(blocks: Block[]): Resource[] {
  return blocks.map(mapBlockToResource);
} 