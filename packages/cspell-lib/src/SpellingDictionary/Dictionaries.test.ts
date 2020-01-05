import * as Dictionaries from './Dictionaries';
import { getDefaultSettings } from '../Settings';

// cspell:ignore café rhône

describe('Validate getDictionary', () => {
    test('tests that userWords are included in the dictionary', () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three', 'café'],
            userWords: ['four', 'five', 'six', 'Rhône'],
        };

        return Dictionaries.getDictionary(settings).then(dict => {
            settings.words.forEach(word => {
                expect(dict.has(word)).toBe(true);
            });
            settings.userWords.forEach(word => {
                expect(dict.has(word)).toBe(true);
            });
            expect(dict.has('zero',     { ignoreCase: false })).toBe(false);
            expect(dict.has('Rhône',    { ignoreCase: false })).toBe(true);
            expect(dict.has('RHÔNE',    { ignoreCase: false })).toBe(true);
            expect(dict.has('Café',     { ignoreCase: false })).toBe(true);
            expect(dict.has('rhône',    { ignoreCase: false })).toBe(true);
            expect(dict.has('rhone',    { ignoreCase: false })).toBe(true);
            expect(dict.has('cafe',     { ignoreCase: false })).toBe(true);
            });
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
            expect(dict.has(word)).toBe(true);
        });
        settings.userWords.forEach(word => {
            expect(dict.has(word)).toBe(true);
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
