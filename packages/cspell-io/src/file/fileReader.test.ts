import * as fReader from './fileReader';
import * as fs from 'fs-extra';

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
});
