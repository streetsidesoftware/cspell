import {expect} from 'chai';
import * as wlh from './wordListHelper';

describe('Validate wordListHelper', () => {
    it('tests splitLineIntoWordsRx', () => {
        const line = 'New York City';
        return wlh.splitLineIntoWordsRx(line)
            .toArray()
            .toPromise()
            .then(words => {
                expect(words).to.be.deep.equal([line, ...line.split(' ')]);
            });
    });

    it('tests splitLineIntoCodeWordsRx', () => {
        const line = 'cSpell:disableCompoundWords extra';
        return wlh.splitLineIntoCodeWordsRx(line)
            .toArray()
            .toPromise()
            .then(words => {
                expect(words).to.be.deep.equal([
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
    });

    it('tests splitLineIntoCodeWordsRx', () => {
        const line = 'New York City';
        return wlh.splitLineIntoCodeWordsRx(line)
            .toArray()
            .toPromise()
            .then(words => {
                expect(words).to.be.deep.equal([
                    'New York City',
                    'New', 'York', 'City',
                ]);
            });
    });

    it('tests loadWordsRx error handling', () => {
        return wlh.loadWordsRx('not_found.txt')
            .toArray()
            .toPromise()
            .then(values => {
                expect(values).to.be.empty;
            });
    });
});
