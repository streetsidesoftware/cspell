import { expect } from 'chai';
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
                expect(dict.has(word)).to.be.true;
            });
            settings.userWords.forEach(word => {
                expect(dict.has(word)).to.be.true;
            });
            expect(dict.has('zero',     { ignoreCase: false })).to.be.false;
            expect(dict.has('Rhône',    { ignoreCase: false })).to.be.true;
            expect(dict.has('RHÔNE',    { ignoreCase: false })).to.be.true;
            expect(dict.has('Café',     { ignoreCase: false })).to.be.true;
            expect(dict.has('rhône',    { ignoreCase: false })).to.be.true;
            expect(dict.has('rhone',    { ignoreCase: false })).to.be.true;
            expect(dict.has('cafe',     { ignoreCase: false })).to.be.true;
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
            expect(dict.has(word)).to.be.true;
        });
        settings.userWords.forEach(word => {
            expect(dict.has(word)).to.be.true;
        });
        const opts = { ignoreCase: false };
        expect(dict.has('zero')).to.be.false;
        expect(dict.has('Rhône', opts)).to.be.true;
        expect(dict.has('RHÔNE', opts)).to.be.true;
        expect(dict.has('Café', opts)).to.be.true;
        expect(dict.has('rhône', opts)).to.be.false;
        expect(dict.has('rhone', opts)).to.be.false;
        expect(dict.has('café', opts)).to.be.true;
        expect(dict.has('rhône', opts)).to.be.false;
        expect(dict.has('rhone', opts)).to.be.false;
        expect(dict.has('cafe', opts)).to.be.false;
        expect(dict.has('café', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhône', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhone', { ignoreCase: true })).to.be.true;
        expect(dict.has('cafe', { ignoreCase: true })).to.be.true;
    });
});
