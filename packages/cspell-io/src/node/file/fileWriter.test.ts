import * as fileWriter from './fileWriter';
import { loremIpsum } from 'lorem-ipsum';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import { readFile } from './fileReader';

const root = path.join(__dirname, '..', '..');
const tempDir = path.join(root, 'temp');

describe('Validate the writer', () => {
    test('tests writing data and reading it back.', async () => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(tempDir, 'tests-writing-an-observable.txt');

        await mkdirp(path.dirname(filename));
        await fileWriter.writeToFileIterableP(filename, data);
        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });

    test('tests writing data and reading it back. gz', async () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(tempDir, 'tests-writing-an-observable.txt.gz');

        await mkdirp(path.dirname(filename));
        await fileWriter.writeToFileIterableP(filename, data);
        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });

    test('tests writeToFile', async () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const filename = path.join(tempDir, 'tests-writing.txt');

        await mkdirp(path.dirname(filename));
        const wStream = fileWriter.writeToFile(filename, text);
        await new Promise((resolve, reject) => {
            wStream.on('close', resolve);
            wStream.on('error', reject);
        });

        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });

    test('tests writeToFile zip', async () => {
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const filename = path.join(tempDir, 'tests-writing.txt.gz');

        await mkdirp(path.dirname(filename));
        const wStream = fileWriter.writeToFile(filename, text);
        await new Promise((resolve, reject) => {
            wStream.on('close', resolve);
            wStream.on('error', reject);
        });

        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });
});
