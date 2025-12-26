import { describe, expect, test } from 'vitest';

// import type { PartialTrieInfo, TrieInfo } from './TrieInfo.ts';
import {
    cvtTrieCharacteristicsToFlags,
    cvtTrieInfoToFlags,
    extractTrieCharacteristics,
    normalizeTrieInfo,
    parseTrieCharacteristics,
    parseTrieInfoFlags,
    TrieInfoBuilder,
} from './TrieInfo.ts';

describe('TrieInfoBuilder', () => {
    test('builds with default settings', () => {
        const builder = new TrieInfoBuilder();
        const def = builder.build();
        expect(def.info).toEqual({});
    });

    test('builds with default settings', () => {
        const info = normalizeTrieInfo();
        const builder = new TrieInfoBuilder(info);
        const def = builder.build();
        expect(def.info).toEqual({
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({});
    });

    test('builds add words. 1', () => {
        const builder = new TrieInfoBuilder();
        builder.addWord('hello');
        builder.addWord('!forbidden');
        builder.addWord('~caseInsensitive');
        builder.addWord('suggestion:suggestedWord');
        builder.addWord('+compound');
        const def = builder.build();
        expect(def.info).toEqual({
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({
            hasForbiddenWords: true,
            hasCompoundWords: true,
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });
    });

    test('builds add words. Alt Chars', () => {
        const builder = new TrieInfoBuilder({
            compoundCharacter: '*',
            stripCaseAndAccentsPrefix: '_',
            forbiddenWordPrefix: '?',
            suggestionPrefix: '+',
        });
        builder.addWord('hello');
        builder.addWord('?forbidden');
        builder.addWord('_caseInsensitive');
        builder.addWord('suggestion+suggestedWord');
        builder.addWord('*compound');
        const def = builder.build();
        expect(def.info).toEqual({
            compoundCharacter: '*',
            stripCaseAndAccentsPrefix: '_',
            forbiddenWordPrefix: '?',
            suggestionPrefix: '+',
        });
        expect(def.characteristics).toEqual({
            hasForbiddenWords: true,
            hasCompoundWords: true,
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });
    });

    test('builds add words. 2', () => {
        const builder = new TrieInfoBuilder();
        builder.addWord('~caseInsensitive');
        builder.addWord('suggestion:suggestedWord');
        const def = builder.build();
        expect(def.info).toEqual({
            stripCaseAndAccentsPrefix: '~',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });

        expect(normalizeTrieInfo(def.info)).toEqual({
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        });
    });

    test('extractTrieCharacteristics', () => {
        const sample = {
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        };

        expect(extractTrieCharacteristics(sample)).toEqual({
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });
    });
});

describe('encode / decode flags', () => {
    test('default settings', () => {
        const info = normalizeTrieInfo();
        const builder = new TrieInfoBuilder(info);
        const def = builder.build();
        expect(def.info).toEqual({
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({});

        expect(cvtTrieInfoToFlags(def.info)).toEqual('!!~~++::');
        expect(parseTrieInfoFlags(cvtTrieInfoToFlags(def.info))).toEqual(def.info);
        expect(cvtTrieCharacteristicsToFlags(def.characteristics)).toEqual('');
        expect(parseTrieCharacteristics(cvtTrieCharacteristicsToFlags(def.characteristics))).toEqual({});
    });

    test('add words. 1', () => {
        const builder = new TrieInfoBuilder();
        builder.addWord('hello');
        builder.addWord('!forbidden');
        builder.addWord('~caseInsensitive');
        builder.addWord('suggestion:suggestedWord');
        builder.addWord('+compound');
        const def = builder.build();
        expect(def.info).toEqual({
            compoundCharacter: '+',
            stripCaseAndAccentsPrefix: '~',
            forbiddenWordPrefix: '!',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({
            hasForbiddenWords: true,
            hasCompoundWords: true,
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });
        expect(cvtTrieInfoToFlags(def.info)).toEqual('!!~~++::');
        expect(parseTrieInfoFlags(cvtTrieInfoToFlags(def.info))).toEqual(def.info);
        expect(cvtTrieCharacteristicsToFlags(def.characteristics)).toEqual('!~+:');
        expect(parseTrieCharacteristics(cvtTrieCharacteristicsToFlags(def.characteristics))).toEqual(
            def.characteristics,
        );
    });

    test('add words. 2', () => {
        const builder = new TrieInfoBuilder();
        builder.addWord('~caseInsensitive');
        builder.addWord('suggestion:suggestedWord');
        const def = builder.build();
        expect(def.info).toEqual({
            stripCaseAndAccentsPrefix: '~',
            suggestionPrefix: ':',
        });
        expect(def.characteristics).toEqual({
            hasNonStrictWords: true,
            hasPreferredSuggestions: true,
        });
        expect(cvtTrieInfoToFlags(def.info)).toEqual('~~::');
        expect(parseTrieInfoFlags(cvtTrieInfoToFlags(def.info))).toEqual(def.info);
        expect(cvtTrieCharacteristicsToFlags(def.characteristics)).toEqual('~:');
        expect(parseTrieCharacteristics(cvtTrieCharacteristicsToFlags(def.characteristics))).toEqual(
            def.characteristics,
        );
    });

    test('builds add words. Alt Chars', () => {
        const builder = new TrieInfoBuilder({
            compoundCharacter: '*',
            stripCaseAndAccentsPrefix: '_',
            forbiddenWordPrefix: '?',
            suggestionPrefix: '+',
        });
        builder.addWord('hello');
        builder.addWord('?forbidden');
        builder.addWord('_caseInsensitive');
        builder.addWord('suggestion+suggestedWord');
        builder.addWord('*compound');
        const def = builder.build();
        // The pairs of
        expect(cvtTrieInfoToFlags(def.info)).toEqual('!?~_+*:+');
        expect(parseTrieInfoFlags(cvtTrieInfoToFlags(def.info))).toEqual(def.info);
        expect(cvtTrieCharacteristicsToFlags(def.characteristics)).toEqual('!~+:');
        expect(parseTrieCharacteristics(cvtTrieCharacteristicsToFlags(def.characteristics))).toEqual(
            def.characteristics,
        );
    });
});
