import { readFile, mkdir } from 'fs/promises';
import { loremIpsum } from 'lorem-ipsum';
import * as path from 'path';
import * as fileWriter from './fileWriter';

const mkdirp = async (p: string) => {
    await mkdir(p, { recursive: true });
};

describe('Validate the writer', () => {
    test('tests writing an Rx.Observable and reading it back.', async () => {
        // cspell:ignore éåáí
        const text = loremIpsum({ count: 1000, format: 'plain', units: 'words' }) + ' éåáí';
        const data = text.split(/\b/);
        const filename = path.join(__dirname, '../../temp/tests-writing-an-observable.txt');

        await mkdirp(path.dirname(filename));
        await fileWriter.writeToFileIterableP(filename, data);
        const result = await readFile(filename, 'utf8');
        expect(result).toBe(text);
    });
});
