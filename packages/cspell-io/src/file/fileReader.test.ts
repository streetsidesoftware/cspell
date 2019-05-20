import { expect } from 'chai';
import * as fReader from './fileReader';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';
import * as asyncIterable from '../async/asyncIterable';

describe('Validate the fileReader', () => {
    const samplePath = path.join(__dirname, '..', '..', 'samples');
    const fileCities = path.join(samplePath, 'cities.txt');
    const sampleFiles = [
        'cities.txt',
        'cities.CRLF.txt',
        'cities.noEOL.txt',
    ].map(f => path.join(samplePath, f));

    it('tests reading a file', async () => {
        const expected = await fs.readFile(__filename, 'utf8');
        const result = await fReader.readFile(__filename, 'utf8');
        expect(result).to.be.equal(expected);
    });

    it('tests stringsToLines', async () => {
        const strings = stringToStream('a1\n2\n3\n4', '5\n6');
        const a = await asyncIterable.toArray(fReader.streamLineByLineAsync(strings));
        expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6']);
    });

    it('tests stringsToLines trailing new line', async () => {
        const strings = stringToStream('a1\n2\n3\n4', '5\n6\n');
        const a = await asyncIterable.toArray(fReader.streamLineByLineAsync(strings));
        expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6', '']);
    });

    it('test the file reader', async () => {
        const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(__filename));
        const actual = lines.join('\n');
        const expected = fs.readFileSync(__filename, 'UTF-8');
        expect(actual).to.equal(expected);
    });

    it('test the lineReaderAsync', async () => {
        const lines = await asyncIterable.toArray(fReader.lineReaderAsync(__filename));
        const expected = fs.readFileSync(__filename, 'UTF-8').split('\n');
        expect(lines).to.deep.equal(expected);
    });

    it('tests reading the cities sample', async () => {
        const lines = await asyncIterable.toArray(fReader.lineReaderAsync(fileCities));
        const file = await fs.readFile(fileCities, 'utf8');
        expect(lines).to.be.deep.equal(file.split('\n'));
    });

    it('tests streamFileLineByLineAsync', async () => {
        await Promise.all(sampleFiles
            .map(async filename => {
                const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(filename));
                const file = await fs.readFile(filename, 'utf8');
                expect(lines, `compare to file: ${filename}`).to.be.deep.equal(file.split(/\r?\n/));
            }));
    });

    it('tests streamFileLineByLineAsync 2', async () => {
        const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(__filename));
        const file = await fs.readFile(__filename, 'utf8');
        expect(lines).to.be.deep.equal(file.split('\n'));
    });

    it('test missing file', async () => {
        const result = asyncIterable.toArray(fReader.lineReaderAsync(__filename + 'not.found'));
        return result.then(
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

function stringToStream(...strings: string[]): NodeJS.ReadableStream {
    return new Readable({
        read: function() {
            for (const s of strings) {
                this.push(s);
            }
            this.push(null);
        }
    });
}
