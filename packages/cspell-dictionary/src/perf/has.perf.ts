import assert from 'node:assert';

import { buildITrieFromWords } from 'cspell-trie-lib';
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';

import { createCachingDictionary } from '../SpellingDictionary/CachingDictionary.js';
import { createSpellingDictionary } from '../SpellingDictionary/createSpellingDictionary.js';
import { createCollection } from '../SpellingDictionary/SpellingDictionaryCollection.js';

suite('dictionary has', async (test) => {
    const words1 = genWords(10_000);
    const words2 = genWords(1000);
    const words3 = genWords(1000);

    const words = words1;

    const iTrie = buildITrieFromWords(words1);
    const dict = createSpellingDictionary(words1, 'test', import.meta.url);
    const dict2 = createSpellingDictionary(words2, 'test2', import.meta.url);
    const dict3 = createSpellingDictionary(words3, 'test3', import.meta.url);

    const dictCol = createCollection([dict, dict2, dict3], 'test-collection');
    const dictColRev = createCollection([dict3, dict2, dict], 'test-collection-reverse');

    const cacheDictSingle = createCachingDictionary(dict, {});
    const cacheDictCol = createCachingDictionary(dictCol, {});

    const dictSet = new Set(words);

    test('Set has 100k words', () => {
        checkWords(dictSet, words);
    });

    test('dictionary has 100k words', () => {
        checkWords(dict, words);
    });

    test('collection has 100k words', () => {
        checkWords(dictCol, words);
    });

    test('collection reverse has 100k words', () => {
        checkWords(dictColRev, words);
    });

    test('cache dictionary has 100k words', () => {
        checkWords(cacheDictSingle, words);
    });

    test('cache collection has 100k words', () => {
        checkWords(cacheDictCol, words);
    });

    test('iTrie has 100k words', () => {
        checkWords(iTrie, words);
    });

    test('iTrie.hasWord has 100k words', () => {
        const dict = { has: (word: string) => iTrie.hasWord(word, true) };
        checkWords(dict, words);
    });

    test('iTrie.data has 100k words', () => {
        checkWords(iTrie.data, words);
    });
});

suite('dictionary has Not', async (test) => {
    const words = genWords(10_000);
    const words2 = genWords(1000);
    const words3 = genWords(1000);
    const missingWords = words.map((w) => w + '-x-');

    const iTrie = buildITrieFromWords(words);
    const dict = createSpellingDictionary(words, 'test', import.meta.url);
    const dict2 = createSpellingDictionary(words2, 'test2', import.meta.url);
    const dict3 = createSpellingDictionary(words3, 'test3', import.meta.url);
    const dictCol = createCollection([dict, dict2, dict3], 'test-collection');

    const dictSet = new Set(words);

    test('Set has not 100k words', () => {
        checkWords(dictSet, missingWords, false);
    });

    test('dictionary has not 100k words', () => {
        checkWords(dict, missingWords, false);
    });

    test('collection has not 100k words', () => {
        checkWords(dictCol, missingWords, false);
    });

    test('iTrie has not 100k words', () => {
        checkWords(iTrie, missingWords, false);
    });

    test('iTrie.hasWord has not 100k words', () => {
        const dict = { has: (word: string) => iTrie.hasWord(word, true) };
        checkWords(dict, missingWords, false);
    });

    test('iTrie.data has not 100k words', () => {
        checkWords(iTrie.data, missingWords, false);
    });
});

suite('dictionary has sampling', async (test) => {
    const words1 = genWords(10_000);
    const words2 = genWords(1000);
    const words3 = genWords(1000);

    const sampleIdx = genSamples(100_000, words1.length);
    const wordsSample = sampleIdx.map((i) => words1[i]);

    const iTrie = buildITrieFromWords(words1);
    const dict = createSpellingDictionary(words1, 'test', import.meta.url);
    const dict2 = createSpellingDictionary(words2, 'test2', import.meta.url);
    const dict3 = createSpellingDictionary(words3, 'test3', import.meta.url);

    const dictCol = createCollection([dict, dict2, dict3], 'test-collection');
    const dictColRev = createCollection([dict3, dict2, dict], 'test-collection-reverse');

    const cacheDictSingle = createCachingDictionary(dict, {});
    const cacheDictCol = createCachingDictionary(dictCol, {});

    const dictSet = new Set(words1);

    test('Set has 100k words', () => {
        checkWords(dictSet, wordsSample);
    });

    test('dictionary has 100k words', () => {
        checkWords(dict, wordsSample);
    });

    test('collection has 100k words', () => {
        checkWords(dictCol, wordsSample);
    });

    test('collection reverse has 100k words', () => {
        checkWords(dictColRev, wordsSample);
    });

    test('cache dictionary has 100k words', () => {
        checkWords(cacheDictSingle, wordsSample);
    });

    test('cache collection has 100k words', () => {
        checkWords(cacheDictCol, wordsSample);
    });

    test('iTrie has 100k words', () => {
        checkWords(iTrie, wordsSample);
    });

    test('iTrie.hasWord has 100k words', () => {
        const dict = { has: (word: string) => iTrie.hasWord(word, true) };
        checkWords(dict, wordsSample);
    });

    test('iTrie.data has 100k words', () => {
        checkWords(iTrie.data, wordsSample);
    });
});

function checkWords(dict: { has: (word: string) => boolean }, words: string[], expected = true, totalChecks = 100_000) {
    let has = true;
    const len = words.length;
    for (let i = 0; i < totalChecks; ++i) {
        const word = words[i % len];
        const r = expected === dict.has(word);
        if (!r) {
            console.log(`Word ${expected ? 'not found' : 'found'}: ${word}`);
        }
        has = r && has;
    }
    assert(has, 'All words should be found in the dictionary');
}

function genWords(count: number, includeForbidden = true): string[] {
    const setOfWords = new Set(loremIpsum({ count }).split(' '));

    if (includeForbidden) {
        setOfWords.add('!forbidden');
        setOfWords.add('!bad-word');
        setOfWords.add('!rejection');
    }

    while (setOfWords.size < count) {
        const words = [...setOfWords];
        for (const a of words) {
            for (const b of words) {
                if (a !== b) {
                    setOfWords.add(a + b);
                }
                if (setOfWords.size >= count) {
                    break;
                }
            }
            if (setOfWords.size >= count) {
                break;
            }
        }
    }

    return [...setOfWords];
}

function genSamples(count: number, max: number, depth = 3) {
    const r = Array<number>(count);
    for (let j = 0; j < count; ++j) {
        let n = Math.random() * max;
        for (let i = 1; i < depth; ++i) {
            n = Math.random() * n;
        }
        r[j] = Math.floor(n);
    }
    return r;
}
