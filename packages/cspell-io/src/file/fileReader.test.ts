import * as fReader from './fileReader';
import { promises as fs } from 'fs';
import * as path from 'path';

const root = path.join(__dirname, '../..');

describe('Validate the fileReader', () => {
    test('tests reading a file', async () => {
        const expected = await fs.readFile(__filename, 'utf8');
        const result = await fReader.readFile(__filename, 'utf8');
        expect(result).toBe(expected);
    });

    test('missing file', async () => {
        const result = fReader.readFile(__filename + '.missing.file', 'utf8');
        await expect(result).rejects.toEqual(expect.objectContaining({ code: 'ENOENT' }));
    });

    test.each`
        file                       | contains
        ${'samples/cities.txt'}    | ${'San Francisco'}
        ${'samples/cities.txt.gz'} | ${'San Francisco'}
    `('reading sync files $file', ({ file, contains }) => {
        const filename = path.resolve(root, file);
        const content = fReader.readFileSync(filename);
        expect(content).toContain(contains);
    });

    test.each`
        file                       | contains
        ${'samples/cities.txt'}    | ${'San Francisco'}
        ${'samples/cities.txt.gz'} | ${'San Francisco'}
    `('reading async files $file', async ({ file, contains }) => {
        const filename = path.resolve(root, file);
        const content = await fReader.readFile(filename);
        expect(content).toContain(contains);
    });
});
