import { expect } from 'chai';
import * as fileWriter from './fileWriter';
import * as fileReader from './fileReader';
import * as Rx from 'rxjs/Rx';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-promise';

describe('Validate the writer', () => {
    it('tests writing an Rx.Observable and reading it back.', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt');

        return Rx.Observable.from(mkdirp(path.dirname(filename)))
            .flatMap(() => {
                return fileWriter.writeToFileRxP(filename, Rx.Observable.from(data));
            })
            .concatMap(() => fileReader.textFileStreamRx(filename))
            .reduce((a, b) => a + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });
});