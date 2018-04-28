import { expect } from 'chai';
import * as fReader from './fileReader';
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('Validate the fileReader', () => {
    const samplePath = path.join(__dirname, '..', '..', 'samples');
    const fileCities = path.join(samplePath, 'cities.txt');
    const sampleFiles = [
        'cities.txt',
        'cities.CRLF.txt',
        'cities.noEOL.txt',
    ].map(f => path.join(samplePath, f));

    it('tests stringsToLines', () => {
        const strings = of('a1\n2\n3\n4', '5\n6');
        return fReader.stringsToLinesRx(strings).pipe(toArray())
        .toPromise().then((a) => {
            expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6']);
        });
    });

    it('tests stringsToLines trailing new line', () => {
        const strings = of('a1\n2\n3\n4', '5\n6\n');
        return fReader.stringsToLinesRx(strings).pipe(toArray()).toPromise().then((a) => {
            expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6', '']);
        });
    });

    it('test the file reader', () => {
        return fReader.stringsToLinesRx(fReader.textFileStreamRx(__filename))
        .pipe(toArray())
        .toPromise()
            .then(lines => {
                const actual = lines.join('\n');
                const expected = fs.readFileSync(__filename, 'UTF-8');
                expect(actual).to.equal(expected);
            });
    });

    it('test the lineReaderRx', () => {
        return fReader.lineReaderRx(__filename)
        .pipe(toArray())
        .toPromise()
            .then(lines => {
                const expected = fs.readFileSync(__filename, 'UTF-8').split('\n');
                expect(lines).to.deep.equal(expected);
            });
    });

    it('tests reading the cities sample', async () => {
        const lines = await fReader.lineReaderRx(fileCities)
        .pipe(toArray())
        .toPromise();
        const file = await fs.readFile(fileCities, 'utf8');
        expect(lines).to.be.deep.equal(file.split('\n'));
    });

    it('tests streamFileLineByLineRx', async () => {
        await Promise.all(sampleFiles
            .map(async filename => {
                const lines = await fReader.streamFileLineByLineRx(filename)
                .pipe(toArray())
                .toPromise();
                const file = await fs.readFile(filename, 'utf8');
                expect(lines, `compare to file: ${filename}`).to.be.deep.equal(file.split(/\r?\n/));
            }));
    });

    it('tests streamFileLineByLineRx 2', async () => {
        const lines = await fReader.streamFileLineByLineRx(__filename)
        .pipe(toArray())
        .toPromise();
        const file = await fs.readFile(__filename, 'utf8');
        expect(lines).to.be.deep.equal(file.split('\n'));
    });

    it('test missing file', () => {
        return fReader.lineReaderRx(__filename + 'not.found')
        .pipe(toArray())
        .toPromise()
            .then(
                () => {
                    expect('not to be here').to.be.true;
                },
                (e) => {
                    expect(e).to.be.instanceof(Error);
                    expect(e.code).to.be.equal('ENOENT');
                }
            );
    });

});
