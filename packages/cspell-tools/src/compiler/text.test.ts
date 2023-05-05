import { describe, expect, test } from 'vitest';

import { splitCamelCaseWord } from './text.js';

describe('split', () => {
    test.each`
        word              | expected
        ${'camelCase'}    | ${['camel', 'Case']}
        ${'ERRORCode'}    | ${['ERROR', 'Code']}
        ${'free2move'}    | ${['free', 'move']}
        ${'2move'}        | ${['move']}
        ${'PrimeNumber5'} | ${['Prime', 'Number']}
    `('splitCamelCaseWord', ({ word, expected }) => {
        expect(splitCamelCaseWord(word)).toEqual(expected);
    });
});
