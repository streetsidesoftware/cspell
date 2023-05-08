import { createTriFromList } from '../../../index.js';
import { readTrie } from '../../../test/dictionaries.test.helper.js';
import { FastTrieBlob } from '../FastTrieBlob.js';
import { measure } from './perf.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

export async function measureFastBlob(which: string | undefined) {
    const trie = await getTrie();
    const words = trie.words().toArray();

    const ft = new FastTrieBlob();
    (!which || which === 'blob') && measure('FastTrieBlob', () => ft.insert(words));
    (!which || which === 'trie') && measure('createTriFromList', () => createTriFromList(words));
}
