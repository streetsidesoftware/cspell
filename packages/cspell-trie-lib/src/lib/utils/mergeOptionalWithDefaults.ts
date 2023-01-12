import { defaultTrieOptions } from '../constants';
import type { PartialTrieOptions, TrieOptions } from '../TrieNode';
import { mergeDefaults } from './mergeDefaults';

export function mergeOptionalWithDefaults(options: PartialTrieOptions): TrieOptions {
    return mergeDefaults(options, defaultTrieOptions);
}
