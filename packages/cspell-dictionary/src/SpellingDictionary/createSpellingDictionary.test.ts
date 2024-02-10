import { promises as fs } from 'node:fs';

import type { DictionaryInformation } from '@cspell/cspell-types';
import type { ITrie } from 'cspell-trie-lib';
import { describe, expect, test } from 'vitest';

import { createFailedToLoadDictionary, createSpellingDictionary } from './createSpellingDictionary.js';
import type { SpellingDictionaryOptions } from './SpellingDictionary.js';
import type { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie.js';

const urlPackageRoot = new URL('../../', import.meta.url);
const urlRepoRoot = new URL('../../', urlPackageRoot);
const urlTestFixtures = new URL('test-fixtures/', urlRepoRoot);
const urlTestFixturesIssues = new URL('issues/', urlTestFixtures);

describe('Validate createSpellingDictionary', () => {
    test('createFailedToLoadDictionary', () => {
        const error = new Error('error');
        const d = createFailedToLoadDictionary('failed dict', './missing.txt', error, {});
        expect(d).toBeTruthy();

        expect(d.getErrors?.()).toEqual([error]);
        expect(d.suggest('error')).toEqual([]);
        expect(d.mapWord('café')).toBe('café');
        expect(d.has('fun')).toBe(false);
        expect(d.find('hello')).toBeUndefined();
        expect(d.isNoSuggestWord('hello', {})).toBe(false);
    });

    test('createSpellingDictionary', () => {
        const words = ['one', 'two', 'three', 'left-right'];
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    test('createSpellingDictionary fa', () => {
        // cspell:disable-next-line
        const words = ['آئینهٔ', 'آبادهٔ', 'کلاه'];
        expect(words).toEqual(words.map((w) => w.normalize('NFC')));
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    test('createSpellingDictionary fa legacy', () => {
        // cspell:disable-next-line
        const words = ['آئینهٔ', 'آبادهٔ', 'کلاه'];
        expect(words).toEqual(words.map((w) => w.normalize('NFC')));
        const d = createSpellingDictionary(
            words.map((w) => w.replace(/\p{M}/gu, '')),
            'test create',
            __filename,
            opts({ caseSensitive: false }),
        );
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });

    // cspell:ignore Geschäft Aujourd'hui
    test('createSpellingDictionary accents', () => {
        const words = ['Geschäft'.normalize('NFD'), 'café', 'book', "Aujourd'hui"];
        const d = createSpellingDictionary(words, 'test create', __filename, opts());
        expect(d.has(words[0])).toBe(true);
        words.forEach((w) => expect(d.has(w)).toBe(true));
        words.map((w) => w.toLowerCase()).forEach((w) => expect(d.has(w)).toBe(true));
        expect(d.has(words[0].toLowerCase())).toBe(true);
        expect(d.has(words[0].toLowerCase(), { ignoreCase: false })).toBe(false);
        expect(d.suggest('geschaft', { ignoreCase: true }).map((r) => r.word)).toEqual([
            'geschaft',
            'geschäft',
            'Geschäft',
        ]);
        expect(d.suggest('geschaft', { ignoreCase: false }).map((r) => r.word)).toEqual(['Geschäft']);
    });

    // cspell:ignore fone failor
    test.each`
        word          | ignoreCase | expected
        ${'Geschäft'} | ${false}   | ${[c('Geschäft', 0)]}
        ${'Geschaft'} | ${false}   | ${[c('Geschäft', 1)]}
        ${'fone'}     | ${false}   | ${[/* c('phone', 70), */ c('gone', 104)]}
        ${'failor'}   | ${false}   | ${[c('failure', 70), c('sailor', 104), c('failed', 175), c('fail', 200)]}
    `('createSpellingDictionary with dictionaryInformation "$word" "$ignoreCase"', ({ word, ignoreCase, expected }) => {
        const words = sampleWords();
        const options = { ...opts(), dictionaryInformation: sampleDictionaryInformation({}) };
        const d = createSpellingDictionary(words, 'test create', __filename, options);
        expect(d.suggest(word, { ignoreCase, numSuggestions: 4 })).toEqual(expected);
    });
});

describe('test-fixtures', () => {
    function readFixtureFile(name: string | URL): Promise<string> {
        return fs.readFile(new URL(name, urlTestFixtures), 'utf8');
    }

    test('issue-5222', async () => {
        const url = new URL('issue-5222/words.txt', urlTestFixturesIssues);
        const words = (await readFixtureFile(url))
            .normalize('NFC')
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);
        const dict = createSpellingDictionary(words, 'issue-5222', url.toString(), {});
        const trie = (dict as SpellingDictionaryFromTrie).trie;
        const setOfWords = new Set(words);
        for (const word of setOfWords) {
            expect(trie.has(word), `trie to have "${word}"`).toBe(true);
        }
        for (const word of trie.words()) {
            expect(word.startsWith('~') || setOfWords.has(word), `to have "${word}"`).toBe(true);
        }
        expect(trie.size).toBeGreaterThan(0);
        expect(size(trie)).toBeGreaterThan(0);
        expect(dict.size).toBeGreaterThan(20);
    });

    function size(trie: ITrie): number {
        // walk the trie and get the approximate size.
        const i = trie.iterate();
        let deeper = true;
        let size = 0;
        for (let r = i.next(); !r.done; r = i.next(deeper)) {
            // count all nodes even though they are not words.
            // because we are not going to all the leaves, this should give a good enough approximation.
            size += 1;
            deeper = r.value.text.length < 5;
        }
        return size;
    }
});

function opts(opts: Partial<SpellingDictionaryOptions> = {}): SpellingDictionaryOptions {
    return {
        weightMap: undefined,
        ...opts,
    };
}

function c(word: string, cost: number) {
    return { word, cost };
}

function sampleDictionaryInformation(di: DictionaryInformation = {}): DictionaryInformation {
    const d: DictionaryInformation = {
        suggestionEditCosts: [
            {
                map: 'f(ph)(gh)|(ail)(ale)|(ur)(er)(ure)(or)',
                replace: 70,
            },
            {
                map: 'aeiou', // cspell:ignore aeiou
                replace: 75,
                swap: 75,
            },
            {
                description: 'common vowel sounds.',
                map: 'o(oh)(oo)|(oo)(ou)|(oa)(ou)',
                replace: 65,
            },
        ],
        ...di,
    };
    return d;
}

function sampleWords() {
    return [
        ...['Geschäft'.normalize('NFD'), 'café', 'book', "Aujourd'hui", 'cafe'],
        ...['go', 'going', 'goes', 'gone'],
        ...['phone', 'fall', 'phones', 'phoning', 'call', 'caller', 'called'],
        ...['fail', 'fall', 'failed', 'failing', 'failure'],
        ...['enough', 'though', 'through'],
        ...['soup', 'soap', 'sooth', 'boot', 'boat'],
        ...['sail', 'sailor', 'sailing', 'sails', 'sailed'],
        ...['sale', 'sold', 'sales', 'selling'],
        ...['tale', 'tail'],
    ];
}
