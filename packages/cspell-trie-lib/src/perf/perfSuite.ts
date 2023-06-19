import assert from 'assert';
import { readFileSync, writeFileSync } from 'fs';

import { selectNearestWords } from '../lib/distance/levenshtein.js';
import type { TrieNode, WeightMap } from '../lib/index.js';
import { createTrieRoot, insert, mapDictionaryInformationToWeightMap, Trie } from '../lib/index.js';
import { suggest as suggestTrieNode } from '../lib/suggest.js';
import { suggestAStar as suggestAStar2 } from '../lib/suggestions/suggestAStar.js';
import { createTrieBlobFromITrieNodeRoot } from '../lib/TrieBlob/createTrieBlob.js';
import type { FastTrieBlob } from '../lib/TrieBlob/FastTrieBlob.js';
import { FastTrieBlobBuilder } from '../lib/TrieBlob/FastTrieBlobBuilder.js';
import { TrieBlob } from '../lib/TrieBlob/TrieBlob.js';
import type { TrieData } from '../lib/TrieData.js';
import { trieRootToITrieRoot } from '../lib/TrieNode/trie.js';
import { buildTrieNodeTrieFromWords } from '../lib/TrieNode/TrieNodeBuilder.js';
import { TrieNodeTrie } from '../lib/TrieNode/TrieNodeTrie.js';
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
    'suggest.en': { desc: 'Measure English Suggestions', auto: false } as Options,
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
    'suggest.en': 'suggest.en',
};

const weightMapEn = getEnglishWeightMap();

class DI {
    private _timer = lazy(() => getGlobalPerfTimer());

    get timer() {
        return this._timer();
    }

    private _trie = lazy(() => {
        return this.timer.measureAsyncFn('getTrie', getTrie);
    });

    get trie() {
        return this._trie();
    }

    private _trieTrie = lazy(async () => {
        return new TrieNodeTrie((await this.trie).root);
    });

    get trieTrie() {
        return this._trieTrie();
    }

    private _trieFast = lazy(() => {
        return this.timer.measureAsyncFn('readFastTrieBlobFromConfig', getFastTrieBlob);
    });

    get trieFastNL() {
        return this._trieFastNL();
    }

    private _trieFastNL = lazy(() => {
        return this.timer.measureAsyncFn('readFastTrieBlobFromConfigNL', getFastTrieBlobNL);
    });

    get trieFast() {
        return this._trieFast();
    }

    private _words = lazy(async () => {
        const trie = await this.trie;
        this.timer.start('words');
        const words = [...trie.words()];
        this.timer.stop('words');
        return words;
    });

    get words() {
        return this._words();
    }
}

interface TestDependencies {
    trie: Trie;
    words: string[];
    trieFast: FastTrieBlob;
    trieFastNL: FastTrieBlob;
}

type DependenciesKeys = keyof TestDependencies;

export async function measurePerf(which: string | undefined, method: string | undefined) {
    const di = new DI();
    const timer = di.timer;
    timer.start('Measure Perf');

    await runTest(which, perf.blob, async () => {
        const dep = await prepare(['trie', 'words']);
        timer.measureFn('blob', () => perfBlob(dep));
    });
    await runTest(which, perf.fast, async () => {
        const dep = await prepare(['trie', 'words']);
        timer.measureFn('fast', () => perfFast(dep));
    });
    await runTest(which, perf.trie, async () => {
        const dep = await prepare(['words']);
        timer.measureFn('trie', () => perfTrie(dep));
    });
    await runTest(which, perf.suggest, async () => {
        const dep = await prepare(['trie', 'words', 'trieFast', 'trieFastNL']);
        timer.measureFn('suggest', () => perfSuggest(dep));
    });
    await runTest(which, perf['suggest.en'], async () => {
        const dep = await prepare(['trieFast']);
        timer.measureFn('suggest.en', () => perfSuggest2(dep));
    });

    timer.stop('Measure Perf');
    timer.stop();
    timer.report();
    return;

    function perfBlob(deps: Pick<TestDependencies, 'trie' | 'words'>) {
        const { trie, words } = deps;
        {
            const ft = timer.measureFn('blob.FastTrieBlobBuilder.fromTrieRoot \t', () =>
                FastTrieBlobBuilder.fromTrieRoot(trie.root)
            );
            timer.measureFn('blob.FastTrieBlob.toTrieBlob \t', () => ft.toTrieBlob());
        }
        const trieBlob = timer.measureFn('blob.createTrieBlobFromITrieNodeRoot\t', () =>
            createTrieBlobFromITrieNodeRoot(trieRootToITrieRoot(trie.root))
        );

        switch (method) {
            case 'has':
                timer.measureFn('blob.TrieBlob.has', () => trieHasWords(trieBlob, words));
                timer.measureFn('blob.TrieBlob.has', () => trieHasWords(trieBlob, words));
                break;
            case 'words':
                timer.start('blob.words');
                [...trieBlob.words()];
                timer.stop('blob.words');

                timer.start('blob.walkerWordsITrie');
                [...walkerWordsITrie(trieBlob.getRoot())];
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

    function perfFast(deps: Pick<TestDependencies, 'trie' | 'words'>) {
        const { trie, words } = deps;
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

    function perfTrie(deps: Pick<TestDependencies, 'words'>) {
        const { words } = deps;
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

    function perfSuggest(params: Pick<TestDependencies, 'trie' | 'trieFast' | 'words' | 'trieFastNL'>) {
        const { words, trieFast, trie, trieFastNL } = params;
        const trieTrie = new TrieNodeTrie(trie.root);
        const count = 8;
        const maxEdits = 3;

        timer.start('filter words');
        const fWords = words.filter((w) => !w.startsWith('~'));
        timer.stop('filter words');

        const trieBlob = timer.measureFn('blob.FastTrieBlob.toTrieBlob', () => trieFast.toTrieBlob());
        const trieBlobNL = timer.measureFn('blob.FastTrieBlob.toTrieBlob NL', () => trieFastNL.toTrieBlob());

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
        timer.measureFn('suggestTrieNode', () =>
            suggestTrieNode(trie.root, 'nearest', { ignoreCase: false, changeLimit: maxEdits })
        );

        // cspell:ignore afgelopen
        const sugWords = ['afgelopen', 'nearest', 'w6gDFScm3qpITum86UhXp4UQ'];
        measureSug(`sug TrieNode`, trieTrie, sugWords, undefined);
        measureSug(`sug TrieNode WM`, trieTrie, sugWords, weightMapEn);
        measureSug(`sug FastTrie`, trieFast, sugWords, undefined);
        measureSug(`sug FastTrie WM`, trieFast, sugWords, weightMapEn);
        measureSug(`sug TrieBlob`, trieBlob, sugWords, undefined);
        measureSug(`sug TrieBlob WM`, trieBlob, sugWords, weightMapEn);
        measureSug(`sug FastTrie NL`, trieFastNL, sugWords, undefined);
        measureSug(`sug TrieBlob NL`, trieBlobNL, sugWords, undefined);

        return;

        function measureSug(name: string, trie: TrieData, words: string[], weightMap: WeightMap | undefined) {
            timer.measureFn(name, () => sugAStar2(trie, words, weightMap));
        }

        function sugAStar2(trie: TrieData, words: string[], weightMap: WeightMap | undefined) {
            for (const word of words) {
                timer.measureFn(`suggestAStar2 ${word}`, () =>
                    suggestAStar2(trie, word, { ignoreCase: false, changeLimit: maxEdits, weightMap })
                );
            }
        }
    }

    function perfSuggest2(params: Pick<TestDependencies, 'trieFast'>) {
        const { trieFast } = params;
        const maxEdits = 3;

        // cspell:ignore afgelopen
        // const sugWords = ['afgelopen', 'nearest', 'w6gDFScm3qpITum86UhXp4UQ'];
        const sugWords = ['nearest'];
        measureSug(`sug FastTrie`, trieFast, sugWords, undefined, 1);
        measureSug(`sug FastTrie`, trieFast, sugWords, undefined, 1);
        measureSug(`sug FastTrie`, trieFast, sugWords, undefined, 100);
        measureSug(`sug FastTrie WM`, trieFast, sugWords, weightMapEn, 1);
        measureSug(`sug FastTrie WM`, trieFast, sugWords, weightMapEn, 1);
        measureSug(`sug FastTrie WM`, trieFast, sugWords, weightMapEn, 100);

        return;

        function measureSug(
            name: string,
            trie: TrieData,
            words: string[],
            weightMap: WeightMap | undefined,
            count: number
        ) {
            for (const word of words) {
                timer.measureFn(
                    `${name} "${word}" x ${count}`,
                    repeat(() => sugAStar2(trie, word, weightMap), count)
                );
            }
        }

        function repeat(fn: () => unknown, count: number) {
            return () => {
                for (let i = 0; i < count; ++i) {
                    fn();
                }
            };
        }

        function sugAStar2(trie: TrieData, word: string, weightMap: WeightMap | undefined) {
            suggestAStar2(trie, word, { ignoreCase: false, changeLimit: maxEdits, weightMap });
        }
    }

    async function prepare<K extends DependenciesKeys>(keys: K[]): Promise<Pick<TestDependencies, K>> {
        const stopTimer = timer.start('prepare');
        const prep: Record<string, unknown> = {};

        for (const key of keys) {
            prep[key] = await di[key];
        }

        stopTimer();

        return prep as Pick<TestDependencies, K>;
    }
}

function filterTest(value: string | undefined, expected: PerfKey): boolean {
    if (value === expected) return true;
    const cfg = PerfConfig[expected];

    return (cfg.auto !== false && !value) || value == 'all';
}

async function runTest(value: string | undefined, expected: PerfKey, fn: () => Promise<void>): Promise<void> {
    if (filterTest(value, expected)) {
        await fn();
    }
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

function getFastTrieBlobNL() {
    return readFastTrieBlobFromConfig('@cspell/dict-nl-nl/cspell-ext.json');
}

function trieHasWords(trie: TrieData, words: string[]): boolean {
    const has = (word: string) => trie.has(word);
    const len = words.length;
    let success = true;
    for (let i = 0; i < len; ++i) {
        success = has(words[i]) && success;
    }
    assert(success);
    return success;
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

function lazy<T>(fn: () => T): () => T {
    let r: { v: T } | undefined = undefined;
    return () => {
        if (r) return r.v;
        const v = fn();
        r = { v };
        return v;
    };
}

// cspell:ignore tion aeiou

function getEnglishWeightMap() {
    return mapDictionaryInformationToWeightMap({
        locale: 'en-US',
        alphabet: 'a-zA-Z',
        suggestionEditCosts: [
            { description: "Words like 'break' and 'brake'", map: '(ate)(eat)|(ake)(eak)', replace: 75 },
            {
                description: 'Sounds alike',
                map: 'f(ph)(gh)|(sion)(tion)(cion)|(ail)(ale)|(r)(ur)(er)(ure)(or)',
                replace: 75,
            },
            {
                description: 'Double letter score',
                map: 'l(ll)|s(ss)|t(tt)|e(ee)|b(bb)|d(dd)',
                replace: 75,
            },
            {
                map: 'aeiou',
                replace: 98,
                swap: 75,
                insDel: 90,
            },
            {
                description: 'Common vowel sounds.',
                map: 'o(oh)(oo)|(oo)(ou)|(oa)(ou)|(ee)(ea)',
                replace: 75,
            },
            {
                map: 'o(oo)|a(aa)|e(ee)|u(uu)|(eu)(uu)|(ou)(ui)(ow)|(ie)(ei)|i(ie)|e(en)|e(ie)',
                replace: 50,
            },
            {
                description: "Do not rank `'s` high on the list.",
                map: "($)('$)('s$)|(s$)(s'$)(s's$)",
                replace: 10,
                penalty: 180,
            },
            {
                description: "Plurals ending in 'y'",
                map: '(ys)(ies)',
                replace: 75,
            },
            {
                map: '(d$)(t$)(dt$)',
                replace: 75,
            },
        ],
    });
}
