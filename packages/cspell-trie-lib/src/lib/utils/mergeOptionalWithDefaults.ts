import { defaultTrieInfo } from '../constants.ts';
import type { PartialTrieInfo, TrieInfo } from '../ITrieNode/TrieInfo.ts';
import { mergeDefaults } from './mergeDefaults.ts';

export type ROPartialTrieOptions = Readonly<PartialTrieInfo>;

export function mergeOptionalWithDefaults(options: ROPartialTrieOptions): TrieInfo;
export function mergeOptionalWithDefaults(
    options: ROPartialTrieOptions,
    ...moreOptions: ROPartialTrieOptions[]
): TrieInfo;
export function mergeOptionalWithDefaults(...options: ROPartialTrieOptions[]): TrieInfo {
    return options.reduce((acc: TrieInfo, opt) => mergeDefaults(opt, acc), defaultTrieInfo);
}
