import type { PartialTrieOptions, TrieOptions } from '../trie.js';
import type { BuilderCursor } from './BuilderCursor.js';

export interface TrieBuilder<T> {
    getCursor(): BuilderCursor;
    build(): T;
    setOptions(options: Readonly<PartialTrieOptions>): Readonly<TrieOptions>;
}
