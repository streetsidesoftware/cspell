import { defaultTrieOptions } from '../constants.js';
import type { PartialTrieOptions, TrieOptions } from '../ITrieNode/TrieOptions.js';
import { mergeDefaults } from './mergeDefaults.js';

export type ROPartialTrieOptions = Readonly<PartialTrieOptions>;

export function mergeOptionalWithDefaults(options: ROPartialTrieOptions): TrieOptions;
export function mergeOptionalWithDefaults(
    options: ROPartialTrieOptions,
    ...moreOptions: ROPartialTrieOptions[]
): TrieOptions;
export function mergeOptionalWithDefaults(...options: ROPartialTrieOptions[]): TrieOptions {
    return options.reduce((acc: TrieOptions, opt) => mergeDefaults(opt, acc), defaultTrieOptions);
}
