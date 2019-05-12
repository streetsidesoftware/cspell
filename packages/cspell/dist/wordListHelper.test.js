"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const wlh = require("./wordListHelper");
const operators_1 = require("rxjs/operators");
describe('Validate wordListHelper', () => {
    it('tests splitLineIntoWordsRx', () => {
        const line = 'New York City';
        return wlh.splitLineIntoWordsRx(line)
            .pipe(operators_1.toArray())
            .toPromise()
            .then(words => {
            chai_1.expect(words).to.be.deep.equal([line, ...line.split(' ')]);
        });
    });
    it('tests splitLineIntoCodeWordsRx', () => {
        const line = 'cSpell:disableCompoundWords extra';
        return wlh.splitLineIntoCodeWordsRx(line)
            .pipe(operators_1.toArray())
            .toPromise()
            .then(words => {
            chai_1.expect(words).to.be.deep.equal([
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
            .pipe(operators_1.toArray())
            .toPromise()
            .then(words => {
            chai_1.expect(words).to.be.deep.equal([
                'New York City',
                'New', 'York', 'City',
            ]);
        });
    });
    it('tests loadWordsRx error handling', () => {
        return wlh.loadWordsRx('not_found.txt')
            .pipe(operators_1.toArray())
            .toPromise()
            .then(values => {
            chai_1.expect(values).to.be.empty;
        });
    });
});
//# sourceMappingURL=wordListHelper.test.js.map