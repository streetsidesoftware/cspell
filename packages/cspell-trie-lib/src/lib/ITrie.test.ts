import { describe, expect, test } from 'vitest';

import { defaultTrieInfo } from './constants.ts';
import type { ITrie } from './ITrie.ts';
import { ITrieImpl as ITrieClass } from './ITrie.ts';
import type { ITrieNode } from './ITrieNode/ITrieNode.ts';
import { parseDictionary, parseDictionaryLegacy } from './SimpleDictionaryParser.ts';
import type { SuggestionOptions } from './suggestions/genSuggestionsOptions.ts';
import { suggestionCollector, type SuggestionCollectorOptions } from './suggestions/suggestCollector.ts';
import { clean } from './utils/clean.ts';
import { normalizeWordToLowercase } from './utils/normalizeWord.ts';
import { CompoundWordsMethod } from './walker/index.ts';

describe('Validate Trie Class', () => {
    const NumSuggestions: SuggestionOptions = { numSuggestions: 10 };
    const SEPARATE_WORDS: SuggestionOptions = { compoundMethod: CompoundWordsMethod.SEPARATE_WORDS };
    test('Tests creating a Trie', () => {
        const trie = ITrieClass.create(sampleWords);
        expect(trie).toBeInstanceOf(ITrieClass);
    });

    test('Tests getting words from a Trie', () => {
        const trie = ITrieClass.create([...sampleWords].sort());
        expect([...trie.words()]).toEqual([...sampleWords].sort());
    });

    test('Tests seeing if a Trie contains a word', () => {
        const trie = ITrieClass.create(sampleWords);
        expect(trie.has('lift')).toBe(true);
        expect(trie.has('fork-lift')).toBe(false);
    });

    test('Tests complete', () => {
        const trie = ITrieClass.create([...sampleWords].sort());
        expect([...trie.completeWord('lift')]).toEqual(sampleWords.filter((w) => w.startsWith('lift')).sort());
        expect([...trie.completeWord('life')]).toEqual([]);
        expect([...trie.completeWord('lifting')]).toEqual(['lifting']);
    });

    test('tests suggestions', () => {
        const trie = ITrieClass.create(sampleWords);
        const suggestions = trie.suggest('wall', NumSuggestions);
        expect(suggestions).toEqual(expect.arrayContaining(['walk']));
    });

    test('tests suggestions 2', () => {
        const trie = ITrieClass.create(sampleWords);
        const suggestions = trie.suggest('wall', NumSuggestions);
        expect(suggestions).toEqual(['walk', 'walks']);
    });

    test('tests suggestions with compounds', () => {
        const trie = ITrieClass.create(sampleWords);
        // cspell:ignore joyostalkliftswak
        const suggestions = trie.suggest('joyostalkliftswak', { ...NumSuggestions, ...SEPARATE_WORDS, changeLimit: 6 });
        // console.warn('%o', { suggestions });
        expect(suggestions).toEqual(expect.arrayContaining(['joyous talk lifts walk']));
    });

    test('tests genSuggestions', () => {
        const trie = ITrieClass.create(sampleWords);
        const collector = suggestionCollector('wall', opts(10));
        trie.genSuggestions(collector);
        expect(collector.suggestions.map((a) => a.word)).toEqual(expect.arrayContaining(['walk']));
    });

    test('Tests iterate', () => {
        const trie = ITrieClass.create([...sampleWords].sort());
        const words = [...trie.iterate()].filter((r) => isWordTerminationNode(r.node)).map((r) => r.text);
        expect(words).toEqual([...sampleWords].sort());
    });

    test('where only part of the word is correct', () => {
        const trie = ITrieClass.create(sampleWords);
        expect(trie.has('talking')).toBe(true);
        expect(trie.has('talkings')).toBe(false);
    });

    test('Tests Trie default options', () => {
        const trie = ITrieClass.create(sampleWords);
        expect(trie).toBeInstanceOf(ITrieClass);
        const options = trie.info;
        expect(options).toEqual(defaultTrieInfo);
    });

    test('Tests Trie options', () => {
        const trie = ITrieClass.create(sampleWords, { forbiddenWordPrefix: '#' });
        expect(trie).toBeInstanceOf(ITrieClass);
        const options = trie.info;
        expect(options).not.toEqual(defaultTrieInfo);
        expect(options.forbiddenWordPrefix).toBe('#');
    });

    test('compound words', () => {
        // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
        const trie = ITrieClass.create(sampleWords);
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
        const trie = ITrieClass.create(sampleWords);
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

    function sampleWordList(): string {
        return `
            # Sample Word List
            Begin*
            *End
            +Middle+
            café
            play*
            *time
            !playtime
        `;
    }

    function sampleSuggestions(): string {
        return `
            # Sample Suggestions
            favourite-> favorite # cspell:ignore favourite
            :colour:color $ cspell:ignore colour
            !playtime:sleep, "play time"
        `;
    }

    function combineSamplesIntoDictionary(...samples: string[]): ITrie {
        return parseDictionary(samples.join('\n'));
    }

    function getCompoundDictionaryITrie(...additions: string[]): ITrie {
        return combineSamplesIntoDictionary(sampleWordList(), ...additions);
    }

    test.each`
        prefix
        ${''}
        ${'+'}
        ${'!'}
    `('word $prefix', ({ prefix }) => {
        const trie = getCompoundDictionaryITrie();
        const words = [...trie.words()];
        expect(words.length).toBe(17);
        expect(words).toContain('Begin+');
        expect(words).toContain('+End');
        expect([...trie.words(prefix)]).toEqual(words.filter((w) => w.startsWith(prefix)));
    });

    test('preferred no suggestions', () => {
        const trie = combineSamplesIntoDictionary(sampleWordList());

        expect(trie.containsPreferredSuggestions()).toBe(false);
    });

    test.only('preferred suggestions', () => {
        const trie = combineSamplesIntoDictionary(sampleSuggestions());

        expect(trie.containsPreferredSuggestions()).toBe(true);
    });

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
        const trie = getCompoundDictionaryITrie();
        expect(trie.hasWord(word, caseSensitive)).toBe(found);
    });

    test.each`
        word                      | caseSensitive | found                     | forbidden    | compoundUsed | comment
        ${'café'}                 | ${true}       | ${'café'}                 | ${undefined} | ${false}     | ${''}
        ${'Café'}                 | ${true}       | ${false}                  | ${undefined} | ${false}     | ${''}
        ${'café'}                 | ${false}      | ${'café'}                 | ${undefined} | ${false}     | ${''}
        ${'Café'}                 | ${false}      | ${false}                  | ${undefined} | ${false}     | ${''}
        ${'BeginMiddleEnd'}       | ${true}       | ${'BeginMiddleEnd'}       | ${false}     | ${true}      | ${''}
        ${'BeginMiddleMiddleEnd'} | ${true}       | ${'BeginMiddleMiddleEnd'} | ${false}     | ${true}      | ${''}
        ${'BeginEnd'}             | ${true}       | ${'BeginEnd'}             | ${false}     | ${true}      | ${''}
        ${'MiddleEnd'}            | ${true}       | ${false}                  | ${undefined} | ${false}     | ${''}
        ${'beginend'}             | ${false}      | ${'beginend'}             | ${false}     | ${true}      | ${'cspell:disable-line'}
        ${'playtime'}             | ${true}       | ${'playtime'}             | ${true}      | ${true}      | ${''}
        ${'playtime'}             | ${false}      | ${'playtime'}             | ${true}      | ${true}      | ${''}
        ${'playmiddletime'}       | ${false}      | ${'playmiddletime'}       | ${false}     | ${true}      | ${'cspell:disable-line'}
    `('findWord $word $caseSensitive $found', ({ word, caseSensitive, found, forbidden, compoundUsed }) => {
        const trie = getCompoundDictionaryITrie();

        const r = trie.findWord(word, { caseSensitive });
        expect(r.found).toBe(found);
        expect(r.forbidden).toBe(forbidden);
        expect(r.compoundUsed).toBe(compoundUsed);
    });

    test.each`
        word                      | caseSensitive | found                        | forbidden | compoundUsed | comment
        ${'BeginMiddleEnd'}       | ${true}       | ${'Begin|Middle|End'}        | ${false}  | ${true}      | ${''}
        ${'BeginMiddleMiddleEnd'} | ${true}       | ${'Begin|Middle|Middle|End'} | ${false}  | ${true}      | ${''}
        ${'BeginEnd'}             | ${true}       | ${'Begin|End'}               | ${false}  | ${true}      | ${''}
        ${'beginend'}             | ${false}      | ${'begin|end'}               | ${false}  | ${true}      | ${'cspell:disable-line'}
        ${'playtime'}             | ${true}       | ${'play|time'}               | ${true}   | ${true}      | ${''}
        ${'playtime'}             | ${false}      | ${'play|time'}               | ${true}   | ${true}      | ${''}
        ${'playmiddletime'}       | ${false}      | ${'play|middle|time'}        | ${false}  | ${true}      | ${'cspell:disable-line'}
    `(
        'findWord $word $caseSensitive $found with compounds sep',
        ({ word, caseSensitive, found, forbidden, compoundUsed }) => {
            const trie = getCompoundDictionaryITrie();
            const r = trie.findWord(word, { caseSensitive, compoundSeparator: '|' });
            expect(r.found).toBe(found);
            expect(r.forbidden).toBe(forbidden);
            expect(r.compoundUsed).toBe(compoundUsed);
        },
    );

    test.each`
        word                      | caseSensitive | found                        | forbidden    | compoundUsed | comment
        ${'café'}                 | ${true}       | ${'café'}                    | ${undefined} | ${false}     | ${''}
        ${'Café'}                 | ${true}       | ${false}                     | ${undefined} | ${false}     | ${''}
        ${'café'}                 | ${false}      | ${'café'}                    | ${undefined} | ${false}     | ${''}
        ${'Café'}                 | ${false}      | ${false}                     | ${undefined} | ${false}     | ${''}
        ${'BeginMiddleEnd'}       | ${true}       | ${'Begin|Middle|End'}        | ${false}     | ${true}      | ${''}
        ${'BeginMiddleMiddleEnd'} | ${true}       | ${'Begin|Middle|Middle|End'} | ${false}     | ${true}      | ${''}
        ${'BeginEnd'}             | ${true}       | ${'Begin|End'}               | ${false}     | ${true}      | ${''}
        ${'MiddleEnd'}            | ${true}       | ${false}                     | ${undefined} | ${false}     | ${''}
        ${'beginend'}             | ${false}      | ${'begin|end'}               | ${false}     | ${true}      | ${'cspell:disable-line'}
        ${'playtime'}             | ${true}       | ${'play|time'}               | ${true}      | ${true}      | ${''}
        ${'playtime'}             | ${false}      | ${'play|time'}               | ${true}      | ${true}      | ${''}
        ${'playmiddletime'}       | ${false}      | ${'play|middle|time'}        | ${false}     | ${true}      | ${'cspell:disable-line'}
    `('legacy findWord $word $caseSensitive $found', ({ word, caseSensitive, found, forbidden, compoundUsed }) => {
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

        const r = trie.findWord(word, { caseSensitive, compoundSeparator: '|' });
        expect(r.found).toBe(found);
        expect(r.forbidden).toBe(forbidden);
        expect(r.compoundUsed).toBe(compoundUsed);
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
    ignoreCase?: boolean,
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
