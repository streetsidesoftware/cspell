import { type ITrie, parseDictionary } from 'cspell-trie-lib';

import type { Reader } from './ReaderOptions.js';
import { readTextFile } from './readTextFile.js';

export async function textFileReader(filename: string): Promise<Reader> {
    const content = await readTextFile(filename);
    const words = content.split('\n').map((s) => s.trim());
    let trie: ITrie | undefined;

    return {
        filename,
        type: 'TextFile',
        size: words.length,
        lines: words,
        toTrie: () => {
            if (trie) return trie;
            trie = parseDictionary(words, { stripCaseAndAccents: false });
            return trie;
        },
    };
}
