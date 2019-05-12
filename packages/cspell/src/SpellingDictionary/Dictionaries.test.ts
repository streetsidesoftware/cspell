import { expect } from 'chai';
import * as Dictionaries from './Dictionaries';
import { getDefaultSettings } from '../Settings';

describe('Validate getDictionary', () => {
    it('tests that userWords are included in the dictionary', () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three'],
            userWords: ['four', 'five', 'six'],
        };

        return Dictionaries.getDictionary(settings).then(dict => {
            settings.words.forEach(word => {
                expect(dict.has(word)).to.be.true;
            });
            settings.userWords.forEach(word => {
                expect(dict.has(word)).to.be.true;
            });
            expect(dict.has('zero')).to.be.false;
        });
    });
});
