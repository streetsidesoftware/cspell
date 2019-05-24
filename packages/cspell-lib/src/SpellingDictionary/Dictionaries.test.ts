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
            expect(dict.has('zero')).to.be.false;
            expect(dict.has('Rhône')).to.be.true;
            expect(dict.has('RHÔNE')).to.be.true;
            expect(dict.has('Café')).to.be.true;
            expect(dict.has('rhône')).to.be.true;
            expect(dict.has('rhone')).to.be.true;
            expect(dict.has('cafe')).to.be.true;
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
        expect(dict.has('zero')).to.be.false;
        expect(dict.has('Rhône')).to.be.true;
        expect(dict.has('RHÔNE')).to.be.true;
        expect(dict.has('Café')).to.be.true;
        expect(dict.has('rhône')).to.be.false;
        expect(dict.has('rhone')).to.be.false;
        expect(dict.has('café')).to.be.true;
        expect(dict.has('rhône')).to.be.false;
        expect(dict.has('rhone')).to.be.false;
        expect(dict.has('cafe')).to.be.false;
        expect(dict.has('café', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhône', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhone', { ignoreCase: true })).to.be.true;
        expect(dict.has('cafe', { ignoreCase: true })).to.be.true;
    });
});
