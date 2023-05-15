import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';

import type { TrieNode } from '../../../index.js';
import { createTrieRoot, insert, Trie } from '../../../index.js';
import { readTrie } from '../../../test/dictionaries.test.helper.js';
import { trieRootToITrieRoot } from '../../TrieNode/trie.js';
import { getGlobalPerfTimer } from '../../utils/timer.js';
import { walkerWordsITrie } from '../../walker/walker.js';
import { createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieRoot } from '../createTrieBlob.js';
import { FastTrieBlobBuilder } from '../FastTrieBlobBuilder.js';
import { TrieBlob } from '../TrieBlob.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

function hasWords(words: string[], method: (word: string) => boolean): boolean {
    const len = words.length;
    let success = true;
    for (let i = 0; i < len; ++i) {
        success = method(words[i]) && success;
    }
    assert(success);
    return success;
}

export async function measureFastBlob(which: string | undefined, method: string | undefined) {
    const timer = getGlobalPerfTimer();
    timer.start('measureFastBlob');
    const trie = await timer.measureAsyncFn('getTrie', getTrie);
    timer.start('words');
    const words = [...trie.words()];
    timer.stop('words');

    timer.mark('done with setup');

    timer.start('blob');
    if (filterTest(which, 'blob')) {
        {
            const ft = timer.measureFn('blob.FastTrieBlobBuilder.fromTrieRoot \t', () =>
                FastTrieBlobBuilder.fromTrieRoot(trie.root)
            );
            timer.measureFn('blob.FastTrieBlob.toTrieBlob \t', () => ft.toTrieBlob());
        }
        const trieBlob = timer.measureFn('blob.createTrieBlobFromTrieRoot\t', () =>
            createTrieBlobFromTrieRoot(trie.root)
        );
        timer.measureFn('blob.createTrieBlobFromITrieNodeRoot\t', () =>
            createTrieBlobFromITrieNodeRoot(trieRootToITrieRoot(trie.root))
        );

        switch (method) {
            case 'has':
                timer.measureFn('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => trieBlob.has(word)));
                timer.measureFn('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => trieBlob.has(word)));
                break;
            case 'words':
                timer.start('blob.words');
                [...trieBlob.words()];
                timer.stop('blob.words');

                timer.start('blob.walkerWordsITrie');
                [...walkerWordsITrie(TrieBlob.toITrieNodeRoot(trieBlob))];
                timer.stop('blob.walkerWordsITrie');
                break;
            case 'dump':
                timer.start('blob.write.TrieBlob.en.json');
                writeFileSync('./TrieBlob.en.json', JSON.stringify(trieBlob, null, 2), 'utf8');
                timer.stop('blob.write.TrieBlob.en.json');

                timer.start('blob.write.TrieBlob.en.trieb');
                writeFileSync('./TrieBlob.en.trieb', trieBlob.encodeBin());
                timer.stop('blob.write.TrieBlob.en.trieb');
                break;
            case 'decode':
                {
                    const tb = timer.measureFn('blob.TrieBlob.decodeBin \t', () => {
                        return TrieBlob.decodeBin(readFileSync('./TrieBlob.en.trieb'));
                    });
                    timer.measureFn('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => tb.has(word)));
                    timer.measureFn('blob.TrieBlob.has \t\t', () => hasWords(words, (word) => tb.has(word)));
                }
                break;
        }
    }
    timer.stop('blob');

    timer.start('fast');
    if (filterTest(which, 'fast')) {
        const ftWordList = timer.measureFn('fast.FastTrieBlobBuilder.fromWordList', () =>
            FastTrieBlobBuilder.fromWordList(words)
        );
        const ft = timer.measureFn('fast.FastTrieBlobBuilder.fromTrieRoot', () =>
            FastTrieBlobBuilder.fromTrieRoot(trie.root)
        );

        switch (method) {
            case 'has':
                timer.measureFn('fast.FastTrieBlob.has', () => hasWords(words, (word) => ft.has(word)));
                timer.measureFn('fast.FastTrieBlob.has', () => hasWords(words, (word) => ft.has(word)));
                break;
            case 'words':
                timer.start('fast.words.fromWordList');
                [...ftWordList.words()];
                timer.stop('fast.words.fromWordList');
                timer.start('fast.words');
                [...ft.words()];
                timer.stop('fast.words');
                break;
        }
    }
    timer.stop('fast');

    timer.start('trie');
    if (filterTest(which, 'trie')) {
        const root = createTrieRoot({});

        timer.measureFn('trie.createTriFromList \t\t', () => insertWords(root, words));
        const trie = new Trie(root);

        switch (method) {
            case 'has':
                timer.measureFn('trie.Trie.has \t\t\t', () => hasWords(words, (word) => trie.hasWord(word, true)));
                timer.measureFn('trie.Trie.has \t\t\t', () => hasWords(words, (word) => trie.hasWord(word, true)));
                break;
            case 'words':
                timer.start('trie.words');
                [...trie.words()];
                timer.stop('trie.words');
                break;
        }
    }
    timer.stop('trie');
    timer.stop('measureFastBlob');
    timer.stop();
    timer.report();
}

function filterTest(value: string | undefined, expected: string): boolean {
    return !value || value === expected || value == 'all';
}

function insertWords(root: TrieNode, words: string[]) {
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
}
