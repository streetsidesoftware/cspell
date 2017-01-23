import { expect } from 'chai';
import * as fileWriter from './fileWriter';
import * as fileReader from './fileReader';
import * as Rx from 'rxjs/Rx';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';

describe('Validate the writer', () => {
    it('tests writing an Rx.Observable and reading it back.', () => {
        const text = loremIpsum({ count: 100, format: 'plain'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', 'temp', 'tests-writing-an-observable.txt');

        const obj = Rx.Observable.from(data);
        const p = fileWriter.writeToFileRxP(filename, obj);
        return Rx.Observable.from(p)
            .concatMap(() => fileReader.textFileStreamRx(filename))
            .reduce((a, b) => a + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });

    });
});