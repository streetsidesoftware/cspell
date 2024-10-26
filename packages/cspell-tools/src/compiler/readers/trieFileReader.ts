import { importTrie, Trie } from 'cspell-trie-lib';

import type { DictionaryReader } from './ReaderOptions.js';
import { readTextFileLines } from './readTextFile.js';

export async function trieFileReader(filename: string): Promise<DictionaryReader> {
    const trieRoot = importTrie(await readTextFileLines(filename));
    const trie = new Trie(trieRoot);
    const words = trie.words();
    return {
        type: 'Trie',
        get size() {
            return trie.size();
        },
        lines: words,
        hasWord: (word: string, caseSensitive: boolean) => trie.hasWord(word, caseSensitive),
    };
}
