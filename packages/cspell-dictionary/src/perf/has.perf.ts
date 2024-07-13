import assert from 'node:assert';

import { buildITrieFromWords } from 'cspell-trie-lib';
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';

import { createSpellingDictionary } from '../SpellingDictionary/createSpellingDictionary.js';
import { createCollection } from '../SpellingDictionary/SpellingDictionaryCollection.js';

suite('dictionary has', async (test) => {
    const words = genWords(10_000);
    const words2 = genWords(1000);
    const words3 = genWords(1000);

    const iTrie = buildITrieFromWords(words);
    const dict = createSpellingDictionary(words, 'test', import.meta.url);
    const dict2 = createSpellingDictionary(words2, 'test2', import.meta.url);
    const dict3 = createSpellingDictionary(words3, 'test3', import.meta.url);

    const dictCol = createCollection([dict, dict2, dict3], 'test-collection');

    test('dictionary has 100k words', () => {
        checkWords(dict, words);
    });

    test('dictionary has 100k words (2nd time)', () => {
        checkWords(dict, words);
    });

    test('collection has 100k words', () => {
        checkWords(dictCol, words);
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

    test('dictionary has 100k words', () => {
        checkWords(dict, missingWords, false);
    });

    test('dictionary has 100k words (2nd time)', () => {
        checkWords(dict, missingWords, false);
    });

    test('collection has 100k words', () => {
        checkWords(dictCol, missingWords, false);
    });

    test('iTrie has 100k words', () => {
        checkWords(iTrie, missingWords, false);
    });

    test('iTrie.hasWord has 100k words', () => {
        const dict = { has: (word: string) => iTrie.hasWord(word, true) };
        checkWords(dict, missingWords, false);
    });

    test('iTrie.data has 100k words', () => {
        checkWords(iTrie.data, missingWords, false);
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
