import { expect } from 'chai';
import * as fileWriter from './fileWriter';
import * as fileReader from './fileReader';
import { from } from 'rxjs';
import { flatMap, concatMap, reduce } from 'rxjs/operators';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';

describe('Validate the writer', () => {
    it('tests writing an Rx.Observable and reading it back.', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt');

        return from(mkdirp(path.dirname(filename))).pipe(
                flatMap(() => {
                    return fileWriter.writeToFileRxP(filename, from(data));
                }),
                concatMap(() => fileReader.textFileStreamRx(filename)),
                reduce((a, b) => a + b),
            )
            .toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });
});