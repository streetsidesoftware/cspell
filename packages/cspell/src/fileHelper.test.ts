import { readFileListFile, readFileListFiles } from './fileHelper';
import * as path from 'path';

const fixtures = path.join(__dirname, '../fixtures/fileHelper');
const fileListFile = path.join(fixtures, 'file-list.txt');
const fileListFile2 = path.join(fixtures, 'nested/file-list-2.txt');

const oc = expect.objectContaining;

describe('fileHelper', () => {
    test('readFileListFile', async () => {
        try {
            const files = ['a', 'b', 'c'];
            process.stdin.isTTY = false;
            const pResult = readFileListFile('stdin');
            process.stdin.push(files.join('\n'));
            process.stdin.emit('end');
            const r = await pResult;
            expect(r).toEqual(files.map((f) => path.resolve(f)));
        } finally {
            process.stdin.isTTY = true;
        }
    });

    test('readFileListFiles', async () => {
        const files = ['file1', '../file2', 'dir/file3', 'nested/file2.txt'];
        const r = await readFileListFiles([fileListFile, fileListFile2]);
        expect(r).toEqual(files.map((f) => path.resolve(fixtures, f)));
    });

    test('readFileListFiles Error', () => {
        const r = readFileListFiles(['not-found.txt']);
        return expect(r).rejects.toEqual(oc({ message: 'Error reading file: "not-found.txt"' }));
    });
});
