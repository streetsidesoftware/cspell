
import { expect } from 'chai';
import * as fileReader from './fileReader';
import * as Rx from 'rx';

describe('validate stringsToLines', () => {
    it('tests stringsToLines', () => {
        const strings = [
            'one ',
            'two \n three',
            '\n',
            '\n',
            'four',
            ' five six seven',
            '\n eight \r\n nine \n ten',
            ' eleven',
            ' twelve \n thirteen '
        ];
        const expected = [
            'one two ',
            ' three',
            '',
            'four five six seven',
            ' eight ',
            ' nine ',
            ' ten eleven twelve ',
            ' thirteen '
        ];

        return fileReader.stringsToLines(Rx.Observable.fromArray(strings))
            .toArray()
            .toPromise()
            .then(result => {
                expect(result).to.deep.equal(expected);
            });
    });
});

describe('validate lineReader', () => {
    it('tests lineReader', () => {
        const expected = ['one', 'two', 'three'];
        return fileReader.lineReader(__dirname + '/../testData/smallfile.txt')
            .toArray()
            .toPromise().then(results => {
                expect(results).to.be.deep.equal(expected);
            });
    });

    it('tests a nl.aff', () => {
        const expected = 'SFX Ax us sere uus	ts:AJce';
        return fileReader.lineReader(__dirname + '/../dictionaries/nl.aff')
            .last()
            .toPromise().then(result => {
                expect(result).to.be.equal(expected);
            });
    });
});