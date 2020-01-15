import * as Dictionaries from './Dictionaries';
import { getDefaultSettings } from '../Settings';

// cspell:ignore café rhône

describe('Validate getDictionary', () => {
    test('tests that userWords are included in the dictionary', async () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three', 'café', '!snarf'],
            userWords: ['four', 'five', 'six', 'Rhône'],
        };

        const dict = await Dictionaries.getDictionary(settings);
        settings.words.forEach(w => {
            const word = w.replace(/^[!+*]+(.*)[*+]+/, '$1');
            const found = w[0] !== '!';
            const result = {word, found: dict.has(word)};
            expect(result).toEqual({ word, found });
        });
        settings.userWords.forEach(w => {
            const word = w.replace(/^[!+*]+(.*)[*+]+/, '$1');
            const found = w[0] !== '!';
            const result = {word, found: dict.has(word)};
            expect(result).toEqual({ word, found });
        });
        expect(dict.has('zero',     { ignoreCase: false })).toBe(false);
        expect(dict.has('Café',     { ignoreCase: false })).toBe(true);
        expect(dict.has('CAFÉ',     { ignoreCase: false })).toBe(true);
        expect(dict.has('café',     { ignoreCase: false })).toBe(true);
        expect(dict.has('cafe',     { ignoreCase: true  })).toBe(true);
        expect(dict.has('CAFE',     { ignoreCase: true  })).toBe(true);
        expect(dict.has('Rhône',    { ignoreCase: false })).toBe(true);
        expect(dict.has('RHÔNE',    { ignoreCase: false })).toBe(true);
        expect(dict.has('rhône',    { ignoreCase: false })).toBe(false);
        expect(dict.has('rhône',    { ignoreCase: true  })).toBe(true);
        expect(dict.has('rhone',    { ignoreCase: false })).toBe(false);
        expect(dict.has('rhone',    { ignoreCase: true  })).toBe(true);
        expect(dict.has('snarf',    { ignoreCase: true  })).toBe(false);
    });

    test('Case sensitive', async () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three', 'café'],
            userWords: ['four', 'five', 'six', 'Rhône'],
            caseSensitive: true,
        };

        const dict = await Dictionaries.getDictionary(settings);
        settings.words.forEach(word => {
            const result = {word, found: dict.has(word)};
            expect(result).toEqual({ word, found: true });
        });
        settings.userWords.forEach(word => {
            const result = {word, found: dict.has(word)};
            expect(result).toEqual({ word, found: true });
        });
        const opts = { ignoreCase: false };
        expect(dict.has('zero')).toBe(false);
        expect(dict.has('Rhône', opts)).toBe(true);
        expect(dict.has('RHÔNE', opts)).toBe(true);
        expect(dict.has('Café', opts)).toBe(true);
        expect(dict.has('rhône', opts)).toBe(false);
        expect(dict.has('rhone', opts)).toBe(false);
        expect(dict.has('café', opts)).toBe(true);
        expect(dict.has('rhône', opts)).toBe(false);
        expect(dict.has('rhone', opts)).toBe(false);
        expect(dict.has('cafe', opts)).toBe(false);
        expect(dict.has('café', { ignoreCase: true })).toBe(true);
        expect(dict.has('rhône', { ignoreCase: true })).toBe(true);
        expect(dict.has('rhone', { ignoreCase: true })).toBe(true);
        expect(dict.has('cafe', { ignoreCase: true })).toBe(true);
    });
});
