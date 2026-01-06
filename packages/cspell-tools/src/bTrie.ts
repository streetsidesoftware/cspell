import type { GenerateBTrieOptions } from './compiler/bTrie.ts';
import { generateBTrieFromFiles } from './compiler/bTrie.ts';

export function generateBTrie(files: string[], options: GenerateBTrieOptions): Promise<void> {
    return generateBTrieFromFiles(files, options);
}
