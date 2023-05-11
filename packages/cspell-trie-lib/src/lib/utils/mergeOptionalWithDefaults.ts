import { defaultTrieOptions } from '../constants.js';
import type { PartialTrieOptions, TrieOptions } from '../TrieNode/TrieNode.js';
import { mergeDefaults } from './mergeDefaults.js';

export function mergeOptionalWithDefaults(options: PartialTrieOptions): TrieOptions {
    return mergeDefaults(options, defaultTrieOptions);
}
