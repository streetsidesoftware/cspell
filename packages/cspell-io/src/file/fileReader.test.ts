import * as fReader from './fileReader';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';
import * as asyncIterable from '../async/asyncIterable';

describe('Validate the fileReader', () => {
    const samplePath = path.join(__dirname, '..', '..', 'samples');
    const fileCities = path.join(samplePath, 'cities.txt');
    const sampleFiles = ['cities.txt', 'cities.CRLF.txt', 'cities.noEOL.txt'].map((f) => path.join(samplePath, f));

    test('tests reading a file', async () => {
        const expected = await fs.readFile(__filename, 'utf8');
        const result = await fReader.readFile(__filename, 'utf8');
        expect(result).toBe(expected);
    });

    test('tests stringsToLines', async () => {
        const strings = stringToStream('a1\n2\n3\n4', '5\n6');
        const a = await asyncIterable.toArray(fReader.streamLineByLineAsync(strings));
        expect(a).toEqual(['a1', '2', '3', '45', '6']);
    });

    test('tests stringsToLines trailing new line', async () => {
        const strings = stringToStream('a1\n2\n3\n4', '5\n6\n');
        const a = await asyncIterable.toArray(fReader.streamLineByLineAsync(strings));
        expect(a).toEqual(['a1', '2', '3', '45', '6', '']);
    });

    test('test the file reader', async () => {
        const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(__filename));
        const actual = lines.join('\n');
        const expected = fs.readFileSync(__filename, 'utf8');
        expect(actual).toBe(expected);
    });

    test('test the lineReaderAsync', async () => {
        const lines = await asyncIterable.toArray(fReader.lineReaderAsync(__filename));
        const expected = fs.readFileSync(__filename, 'utf8').split('\n');
        expect(lines).toEqual(expected);
    });

    test('tests reading the cities sample', async () => {
        const lines = await asyncIterable.toArray(fReader.lineReaderAsync(fileCities));
        const file = await fs.readFile(fileCities, 'utf8');
        expect(lines).toEqual(file.split('\n'));
    });

    test('tests streamFileLineByLineAsync', async () => {
        await Promise.all(
            sampleFiles.map(async (filename) => {
                const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(filename));
                const file = await fs.readFile(filename, 'utf8');
                // compare to file: ${filename}
                expect(lines).toEqual(file.split(/\r?\n/));
            })
        );
    });

    test('tests streamFileLineByLineAsync 2', async () => {
        const lines = await asyncIterable.toArray(fReader.streamFileLineByLineAsync(__filename));
        const file = await fs.readFile(__filename, 'utf8');
        expect(lines).toEqual(file.split('\n'));
    });

    test('test missing file', async () => {
        const result = asyncIterable.toArray(fReader.lineReaderAsync(__filename + 'not.found'));
        return result.then(
            () => {
                expect('not to be here').toBe(true);
            },
            (e) => {
                // expect(e).to.be.instanceof(Error); // Since jest currently mocks Error, this test fails.
                expect(e.code).toBe('ENOENT');
            }
        );
    });
});

function stringToStream(...strings: string[]): NodeJS.ReadableStream {
    return new Readable({
        read: function () {
            for (const s of strings) {
                this.push(s);
            }
            this.push(null);
        },
    });
}
