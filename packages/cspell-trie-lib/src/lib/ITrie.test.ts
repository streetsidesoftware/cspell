import { describe, expect, test } from 'vitest';

import { defaultTrieInfo } from './constants.js';
import { ITrieImpl as ITrie } from './ITrie.js';
import type { ITrieNode } from './ITrieNode/ITrieNode.js';
import { parseDictionaryLegacy } from './SimpleDictionaryParser.js';
import type { SuggestionOptions } from './suggestions/genSuggestionsOptions.js';
import { suggestionCollector, type SuggestionCollectorOptions } from './suggestions/suggestCollector.js';
import { clean } from './utils/clean.js';
import { normalizeWordToLowercase } from './utils/normalizeWord.js';
import { CompoundWordsMethod } from './walker/index.js';

describe('Validate Trie Class', () => {
    const NumSuggestions: SuggestionOptions = { numSuggestions: 10 };
    const SEPARATE_WORDS: SuggestionOptions = { compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
    test('Tests creating a Trie', () => {
        const trie = ITrie.create(sampleWords);
        expect(trie).toBeInstanceOf(ITrie);
    });

    test('Tests getting words from a Trie', () => {
        const trie = ITrie.create([...sampleWords].sort());
        expect([...trie.words()]).toEqual([...sampleWords].sort());
    });

    test('Tests seeing if a Trie contains a word', () => {
        const trie = ITrie.create(sampleWords);
        expect(trie.has('lift')).toBe(true);
        expect(trie.has('fork-lift')).toBe(false);
    });

    test('Tests complete', () => {
        const trie = ITrie.create([...sampleWords].sort());
        expect([...trie.completeWord('lift')]).toEqual(sampleWords.filter((w) => w.startsWith('lift')).sort());
        expect([...trie.completeWord('life')]).toEqual([]);
        expect([...trie.completeWord('lifting')]).toEqual(['lifting']);
    });

    test('tests suggestions', () => {
        const trie = ITrie.create(sampleWords);
        const suggestions = trie.suggest('wall', NumSuggestions);
        expect(suggestions).toEqual(expect.arrayContaining(['walk']));
    });

    test('tests suggestions 2', () => {
        const trie = ITrie.create(sampleWords);
        const suggestions = trie.suggest('wall', NumSuggestions);
        expect(suggestions).toEqual(['walk', 'walks']);
    });

    test('tests suggestions with compounds', () => {
        const trie = ITrie.create(sampleWords);
        // cspell:ignore joyostalkliftswak
        const suggestions = trie.suggest('joyostalkliftswak', { ...NumSuggestions, ...SEPARATE_WORDS });
        console.warn('%o', { suggestions });
        expect(suggestions).toEqual(expect.arrayContaining(['joyous talk lifts walk']));
    });

    test('tests genSuggestions', () => {
        const trie = ITrie.create(sampleWords);
        const collector = suggestionCollector('wall', opts(10));
        trie.genSuggestions(collector);
        expect(collector.suggestions.map((a) => a.word)).toEqual(expect.arrayContaining(['walk']));
    });

    test('Tests iterate', () => {
        const trie = ITrie.create([...sampleWords].sort());
        const words = [...trie.iterate()].filter((r) => isWordTerminationNode(r.node)).map((r) => r.text);
        expect(words).toEqual([...sampleWords].sort());
    });

    test('where only part of the word is correct', () => {
        const trie = ITrie.create(sampleWords);
        expect(trie.has('talking')).toBe(true);
        expect(trie.has('talkings')).toBe(false);
    });

    test('Tests Trie default options', () => {
        const trie = ITrie.create(sampleWords);
        expect(trie).toBeInstanceOf(ITrie);
        const options = trie.info;
        expect(options).toEqual(defaultTrieInfo);
    });

    test('Tests Trie options', () => {
        const trie = ITrie.create(sampleWords, { forbiddenWordPrefix: '#' });
        expect(trie).toBeInstanceOf(ITrie);
        const options = trie.info;
        expect(options).not.toEqual(defaultTrieInfo);
        expect(options.forbiddenWordPrefix).toBe('#');
    });

    test('compound words', () => {
        // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
        const trie = ITrie.create(sampleWords);
        expect(trie.has('talkinglift', true)).toBe(true);
        expect(trie.has('joywalk', true)).toBe(true);
        expect(trie.has('jaywalk', true)).toBe(true);
        expect(trie.has('jwalk', true)).toBe(false);
        expect(trie.has('awalk', true)).toBe(false);
        expect(trie.has('jayjay', true)).toBe(true);
        expect(trie.has('jayjay', 4)).toBe(false);
        expect(trie.has('jayi', 3)).toBe(false);
        expect(trie.has('toto', true)).toBe(false);
        expect(trie.has('toto', 2)).toBe(true);
        expect(trie.has('toto', 1)).toBe(true);
        expect(trie.has('iif', 1)).toBe(true);
        expect(trie.has('uplift', true)).toBe(false);
        expect(trie.has('endless', true)).toBe(true);
        expect(trie.has('joywalk', false)).toBe(false);
        expect(trie.has('walked', true)).toBe(true);
    });

    test('size', () => {
        const trie = ITrie.create(sampleWords);
        expect(trie.numWords()).toBe(80);
        // Request again to make sure it is the same value twice since the calculation is lazy.
        expect(trie.numWords()).toBe(80);
    });

    test('isSizeKnown', () => {
        const trieModern = parseDictionaryLegacy(`
        # Sample Word List
        begin*
        *end
        café
        `);

        expect(trieModern.isSizeKnown()).toBe(false);
        expect(trieModern.size()).toBe(6); // begin, begin+, end, +end, café ~cafe
        expect(trieModern.isSizeKnown()).toBe(true);
    });

    interface HasWordTestCase {
        word: string;
        caseSensitive: boolean;
        found: boolean;
    }

    test.each`
        word                                | caseSensitive | found    | comment
        ${'café'}                           | ${true}       | ${true}  | ${''}
        ${'Café'}                           | ${true}       | ${false} | ${''}
        ${'café'}                           | ${false}      | ${true}  | ${''}
        ${'Café'}                           | ${false}      | ${false} | ${''}
        ${normalizeWordToLowercase('café')} | ${false}      | ${true}  | ${''}
        ${normalizeWordToLowercase('Café')} | ${false}      | ${true}  | ${''}
        ${'BeginMiddleEnd'}                 | ${true}       | ${true}  | ${''}
        ${'BeginMiddleMiddleEnd'}           | ${true}       | ${true}  | ${''}
        ${'BeginEnd'}                       | ${true}       | ${true}  | ${''}
        ${'MiddleEnd'}                      | ${true}       | ${false} | ${''}
        ${'beginend'}                       | ${false}      | ${true}  | ${'cspell:disable-line'}
        ${'playtime'}                       | ${true}       | ${false} | ${''}
        ${'playtime'}                       | ${false}      | ${false} | ${''}
        ${'playmiddletime'}                 | ${false}      | ${true}  | ${'cspell:disable-line'}
    `('hasWord $word $caseSensitive $found', ({ word, caseSensitive, found }: HasWordTestCase) => {
        const trie = parseDictionaryLegacy(`
        # Sample Word List
        Begin*
        *End
        +Middle+
        café
        play*
        *time
        !playtime
        `);

        expect(trie.hasWord(word, caseSensitive)).toBe(found);
    });

    // cspell:ignore begintime
    test('hasWord', () => {
        const trie = parseDictionaryLegacy(`
        # Sample Word List
        Begin*
        *End
        +Middle+
        café
        play*
        *time
        !playtime
        ~!begintime
        `);

        // Forbidden word
        expect(trie.isForbiddenWord('playtime')).toBe(true);
        expect(trie.isForbiddenWord('Playtime')).toBe(false);

        expect(trie.hasWord('playtime', true)).toBe(false);
        expect(trie.hasWord('playtime', false)).toBe(false);
        expect(trie.hasWord('playmiddletime', false)).toBe(true); // cspell:disable-line
        expect(trie.hasWord('Begintime', true)).toBe(true);
        expect(trie.hasWord('Begintime', false)).toBe(true);
        expect(trie.hasWord('begintime', true)).toBe(false);
        expect(trie.hasWord('begintime', false)).toBe(false);

        // Check parity with has
        expect(trie.has('playtime')).toBe(false);
        expect(trie.has('play+time')).toBe(false);
        expect(trie.has('play')).toBe(true);
        expect(trie.has('play+')).toBe(true);
        expect(trie.has('BeginMiddleEnd')).toBe(true);
    });

    test('find', () => {
        const trie = parseDictionaryLegacy(`
        # Sample Word List
        Begin*
        *End
        +Middle+
        café
        play*
        *time
        !playtime
        `);

        expect(trie.find('Begin')?.f).toBe(1);
        expect(trie.find('Begin+')?.f).toBe(1);
        expect(trie.find('playtime')?.f).toBe(1);
        expect(trie.find('playtime', true)?.f).toBe(1);
        expect(trie.find('playtime', 99)?.f).toBeUndefined();
        expect(trie.find('play+time', true)?.f).toBe(1);
        expect(trie.find('play++time', true)?.f).toBe(1);
    });
});

const sampleWords = [
    'a',
    'i',
    'an',
    'as',
    'at',
    'be',
    'bi',
    'by',
    'do',
    'eh',
    'go',
    'he',
    'hi',
    'if',
    'in',
    'is',
    'it',
    'me',
    'my',
    'oh',
    'ok',
    'on',
    'so',
    'to',
    'uh',
    'um',
    'up',
    'us',
    'we',
    'edit',
    'end',
    'edge',
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'talk',
    'talks',
    'talked',
    'talker',
    'talking',
    'less',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'jay',
    'journal',
    'journals',
    'journalism',
    'journalist',
    'journalistic',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
];

function opts(
    maxNumSuggestions: number,
    filter?: SuggestionCollectorOptions['filter'],
    changeLimit?: number,
    includeTies?: boolean,
    ignoreCase?: boolean
): SuggestionCollectorOptions {
    return clean({
        numSuggestions: maxNumSuggestions,
        filter,
        changeLimit,
        includeTies,
        ignoreCase,
    });
}

function isWordTerminationNode(n: ITrieNode): boolean {
    return n.eow;
}
