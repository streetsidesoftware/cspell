import { describe, expect, test, vi } from 'vitest';

import * as wlh from './wordListHelper';

vi.mock('./util/logger');

describe('Validate wordListHelper', () => {
    test('tests splitLineIntoWords', () => {
        const line = 'New York City';
        const words = wlh.splitLineIntoWords(line);
        expect([...words]).toEqual([line, ...line.split(' ')]);
    });

    test('tests splitLineIntoCodeWords', () => {
        const line = 'cSpell:disableCompoundWords extra';
        const words = wlh.splitLineIntoCodeWords(line);
        expect([...words]).toEqual([
            'cSpell',
            'disableCompoundWords',
            'extra',
            'c',
            'Spell',
            'disable',
            'Compound',
            'Words',
        ]);
    });

    test('tests splitLineIntoCodeWordsRx', () => {
        const line = 'New York City';
        const words = wlh.splitLineIntoCodeWords(line);
        expect([...words]).toEqual(['New York City', 'New', 'York', 'City']);
    });

    test('tests loadWordsRx error handling', async () => {
        const values = await wlh.loadWordsNoError('not_found.txt');
        expect([...values]).toHaveLength(0);
    });
});
