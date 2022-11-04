import { readTextFile } from './fileCache';

describe('readTextFile', () => {
    test('we get the same file.', async () => {
        const a = readTextFile(__filename);
        const b = readTextFile(__filename);
        expect(b).toBe(a);
        await a;
    });
});
