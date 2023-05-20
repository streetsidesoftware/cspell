import type { PartialTrieOptions, TrieOptions } from '../trie.js';
import type { TrieData } from '../TrieData.js';
import type { BuilderCursor } from './BuilderCursor.js';

export interface TrieBuilder<T extends TrieData> {
    getCursor(): BuilderCursor;
    build(): T;
    setOptions(options: Readonly<PartialTrieOptions>): Readonly<TrieOptions>;
}
