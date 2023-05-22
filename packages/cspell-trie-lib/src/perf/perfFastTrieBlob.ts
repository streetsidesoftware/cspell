import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';

import type { TrieNode } from '../index.js';
import { createTrieRoot, insert, Trie } from '../index.js';
import { selectNearestWords } from '../lib/distance/levenshtein.js';
import { createTrieBlobFromITrieNodeRoot, createTrieBlobFromTrieRoot } from '../lib/TrieBlob/createTrieBlob.js';
import { FastTrieBlobBuilder } from '../lib/TrieBlob/FastTrieBlobBuilder.js';
import { TrieBlob } from '../lib/TrieBlob/TrieBlob.js';
import { trieRootToITrieRoot } from '../lib/TrieNode/trie.js';
import { buildTrieNodeTrieFromWords } from '../lib/TrieNode/TrieNodeBuilder.js';
import { getGlobalPerfTimer } from '../lib/utils/timer.js';
import { walkerWordsITrie } from '../lib/walker/walker.js';
import { readFastTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.js';
import { selectNearestWordsBruteForce } from './levenshtein.js';

interface Options {
    desc: string;
    auto?: boolean;
}

export const PerfConfig = {
    all: { desc: 'Run all tests.' } as Options,
    none: { desc: 'Only run setup.' } as Options,
    blob: { desc: 'Run tests for TrieBlob' } as Options,
    fast: { desc: 'Run tests for FastTrieBlob' } as Options,
    trie: { desc: 'Run tests for original TrieNode' } as Options,
    suggest: { desc: 'Run tests for spelling suggests algorithms', auto: false } as Options,
} as const;

type PerfConfig = typeof PerfConfig;
type PerfKey = keyof PerfConfig;

type PerfNames = {
    [K in PerfKey]: K;
};

const perf: PerfNames = {
    all: 'all',
    none: 'none',
    blob: 'blob',
    fast: 'fast',
    trie: 'trie',
    suggest: 'suggest',
};

export async function measurePerf(which: string | undefined, method: string | undefined) {
    const timer = getGlobalPerfTimer();
    timer.start('Measure Perf');
    const trie = await timer.measureAsyncFn('getTrie', getTrie);
    await timer.measureAsyncFn('readFastTrieBlobFromConfig', getFastTrieBlob);
    timer.start('words');
    const words = [...trie.words()];
    timer.stop('words');

    timer.mark('done with setup');

    filterTest(which, perf.blob) && timer.measureFn('blob', perfBlob);
    filterTest(which, perf.fast) && timer.measureFn('fast', perfFast);
    filterTest(which, perf.trie) && timer.measureFn('trie', perfTrie);
    filterTest(which, perf.suggest) && timer.measureFn('suggest', perfSuggest);

    timer.stop('Measure Perf');
    timer.stop();
    timer.report();
    return;

    function perfBlob() {
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

    function perfFast() {
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

    function perfTrie() {
        const root = createTrieRoot({});

        timer.measureFn('trie.createTriFromList \t\t', () => insertWords(root, words));
        const trie = new Trie(root);

        timer.measureFn('trie.buildTrieNodeTrieFromWords', () => buildTrieNodeTrieFromWords(words));

        switch (method) {
            case 'has':
                timer.measureFn('trie.Trie.has', () => hasWords(words, (word) => trie.hasWord(word, true)));
                timer.measureFn('trie.Trie.has', () => hasWords(words, (word) => trie.hasWord(word, true)));
                break;
            case 'words':
                timer.start('trie.words');
                [...trie.words()];
                timer.stop('trie.words');
                break;
        }
    }

    function perfSuggest() {
        const count = 8;
        const maxEdits = 3;

        timer.start('filter words');
        const fWords = words.filter((w) => !w.startsWith('~'));
        timer.stop('filter words');

        timer.measureFn('selectNearestWordsBruteForce', () =>
            selectNearestWordsBruteForce('nearest', fWords, count, maxEdits)
        );

        // const sr =
        timer.measureFn('selectNearestWords', () => selectNearestWords('nearest', fWords, count, maxEdits));
        // console.warn('%o', sr);
        // const sc =
        timer.measureFn('trie.suggestWithCost', () =>
            trie.suggestWithCost('nearest', { ignoreCase: false, changeLimit: maxEdits })
        );
        // console.warn('%o', sc);
    }
}

function filterTest(value: string | undefined, expected: PerfKey): boolean {
    if (value === expected) return true;
    const cfg = PerfConfig[expected];

    return (cfg.auto !== false && !value) || value == 'all';
}

function insertWords(root: TrieNode, words: string[]) {
    for (const word of words) {
        if (word.length) {
            insert(word, root);
        }
    }
}

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function getFastTrieBlob() {
    return readFastTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
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
