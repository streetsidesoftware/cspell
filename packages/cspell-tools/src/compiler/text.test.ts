import { describe, expect, test } from 'vitest';

import { isSingleLetter, splitCamelCaseWord, splitCamelCaseWordAutoStem } from './text.js';

describe('split', () => {
    test.each`
        word              | expected
        ${'camelCase'}    | ${['camel', 'Case']}
        ${'ERRORCode'}    | ${['ERROR', 'Code']}
        ${'free2move'}    | ${['free', 'move']}
        ${'2move'}        | ${['move']}
        ${'PrimeNumber5'} | ${['Prime', 'Number']}
    `('splitCamelCaseWord $word', ({ word, expected }) => {
        expect(splitCamelCaseWord(word)).toEqual(expected);
    });

    test.each`
        word              | expected
        ${'camelCases'}   | ${['camel', 'Cases']}
        ${'ERRORs'}       | ${['Errors']}
        ${'USER_ERRORs'}  | ${['USER', 'Errors']}
        ${'USERs_ERRORs'} | ${['Users', 'Errors']}
        ${'WORKs_ERRORs'} | ${['Works', 'Errors']}
        ${'WORKas'}       | ${['WOR', 'Kas']}
    `('splitCamelCaseWordAutoStem $word', ({ word, expected }) => {
        expect(splitCamelCaseWordAutoStem(word)).toEqual(expected);
    });

    test.each`
        letter                  | expected
        ${'a'}                  | ${true}
        ${'é'}                  | ${true}
        ${'é'.normalize('NFD')} | ${true}
        ${'1'}                  | ${false}
    `('isSingleLetter $letter', ({ letter, expected }) => {
        expect(isSingleLetter(letter)).toBe(expected);
    });
});
