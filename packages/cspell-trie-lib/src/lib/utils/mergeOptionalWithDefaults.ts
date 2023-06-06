import { defaultTrieInfo } from '../constants.js';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.js';
import { mergeDefaults } from './mergeDefaults.js';

export type ROPartialTrieOptions = Readonly<PartialTrieInfo>;

export function mergeOptionalWithDefaults(options: ROPartialTrieOptions): TrieInfo;
export function mergeOptionalWithDefaults(
    options: ROPartialTrieOptions,
    ...moreOptions: ROPartialTrieOptions[]
): TrieInfo;
export function mergeOptionalWithDefaults(...options: ROPartialTrieOptions[]): TrieInfo {
    return options.reduce((acc: TrieInfo, opt) => mergeDefaults(opt, acc), defaultTrieInfo);
}
