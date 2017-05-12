import { expect } from 'chai';
import * as fileWriter from './fileWriter';
import * as fileReader from './fileReader';
import * as Rx from 'rxjs/Rx';
import * as loremIpsum from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as fse from 'fs-extra';

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

    it('tests writing an Rx.Observable and reading it back. gz', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing-an-observable.txt.gz');

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

    it('tests writeToFile', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing.txt');

        return Rx.Observable.from(mkdirp(path.dirname(filename)))
            .flatMap(() => {
                const wStream = fileWriter.writeToFile(filename, text);
                return Rx.Observable.fromEvent(wStream, 'close');
            })
            .take(1)
            .concatMap(() => fse.readFile(filename))
            .map(buffer => buffer.toString('utf8'))
            .take(1)
            .toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });

    it('tests writeToFile zip', () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words'}) + ' éåáí';
        const filename = path.join(__dirname, '..', '..', 'temp', 'tests-writing.txt.gz');

        return Rx.Observable.from(mkdirp(path.dirname(filename)))
            .flatMap(() => {
                const wStream = fileWriter.writeToFile(filename, text);
                return Rx.Observable.fromEvent(wStream, 'close');
            })
            .take(1)
            .concatMap(() => fileReader.textFileStreamRx(filename))
            .reduce((a, b) => a + b)
            .toPromise()
            .then(result => {
                expect(result).to.equal(text);
            });
    });
});
