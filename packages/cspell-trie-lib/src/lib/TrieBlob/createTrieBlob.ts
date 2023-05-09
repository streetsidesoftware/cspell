import { FastTrieBlob } from './FastTrieBlob.js';
import type { TrieBlob } from './TrieBlob.js';

export function createTrieBlob(words: string[]): TrieBlob {
    const ft = FastTrieBlob.create(words);
    return ft.toTrieBlob();
}
