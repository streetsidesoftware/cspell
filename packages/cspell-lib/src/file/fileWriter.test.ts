import { expect } from 'chai';
import * as fileWriter from './fileWriter';
import * as fileReader from './fileReader';
import { fromEvent, from } from 'rxjs';
import { flatMap, concatMap, reduce, take, map } from 'rxjs/operators';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as fse from 'fs-extra';

describe('Validate the writer', () => {
    it('tests writing an Observable and reading it back.', () => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt');

        return from(mkdirp(path.dirname(filename))).pipe(
            flatMap(() => {
                return fileWriter.writeToFileRxP(filename, from(data));
            }),
            concatMap(() => fileReader.textFileStreamRx(filename)),
            reduce((a, b) => a + b),
        ).toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });

    it('tests writing an Observable and reading it back. gz', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt.gz');

        return from(mkdirp(path.dirname(filename))).pipe(
            flatMap(() => {
                return fileWriter.writeToFileRxP(filename, from(data));
            }),
            concatMap(() => fileReader.textFileStreamRx(filename)),
            reduce((a, b) => a + b),
        ).toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });

    it('tests writeToFile', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing.txt');

        return from(mkdirp(path.dirname(filename))).pipe(
            flatMap(() => {
                const wStream = fileWriter.writeToFile(filename, text);
                return fromEvent(wStream, 'close');
            }),
            take(1),
            concatMap(() => fse.readFile(filename)),
            map(buffer => buffer.toString('utf8')),
            take(1),
        ).toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });

    it('tests writeToFile zip', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing.txt.gz');

        return from(mkdirp(path.dirname(filename))).pipe(
            flatMap(() => {
                const wStream = fileWriter.writeToFile(filename, text);
                return fromEvent(wStream, 'close');
            }),
            take(1),
            concatMap(() => fileReader.textFileStreamRx(filename)),
            reduce((a, b) => a + b),
        ).toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });
});
