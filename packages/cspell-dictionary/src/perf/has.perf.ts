import assert from 'node:assert';

import { buildITrieFromWords } from 'cspell-trie-lib';
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';

import { createSpellingDictionary } from '../SpellingDictionary/createSpellingDictionary.js';

suite('dictionary has', async (test) => {
    const words = genWords(10_000);

    const iTrie = buildITrieFromWords(words);
    const dict = createSpellingDictionary(words, 'test', import.meta.url);

    test('dictionary has 100k words', () => {
        checkWords(dict, words);
    });

    test('dictionary has 100k words (2nd time)', () => {
        checkWords(dict, words);
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

function checkWords(dict: { has: (word: string) => boolean }, words: string[], totalChecks = 100_000) {
    let has = true;
    const len = words.length;
    for (let i = 0; i < totalChecks; ++i) {
        const word = words[i % len];
        has = dict.has(word) && has;
    }
    assert(has, 'All words should be found in the dictionary');
}

function genWords(count: number): string[] {
    const setOfWords = new Set(loremIpsum({ count }).split(' '));

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
