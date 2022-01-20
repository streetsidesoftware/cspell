import { readFileInfo, readFileListFile, readFileListFiles } from './fileHelper';
import * as path from 'path';
import { IOError } from './util/errors';

const fixtures = path.join(__dirname, '../fixtures/fileHelper');
const fileListFile = path.join(fixtures, 'file-list.txt');
const fileListFile2 = path.join(fixtures, 'nested/file-list-2.txt');

const oc = expect.objectContaining;
const r = path.resolve;

describe('fileHelper', () => {
    test('readFileListFile', async () => {
        try {
            const files = ['a', 'b', 'c'];
            process.stdin.isTTY = false;
            const pResult = readFileListFile('stdin');
            process.stdin.push(files.join('\n'));
            // need to delay the `end` event or it might become a race condition.
            setTimeout(() => process.stdin.emit('end'), 1);
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
        return expect(r).rejects.toEqual(oc({ message: 'Error reading file list from: "not-found.txt"' }));
    });

    test.each`
        filename       | handleNotFound | expected
        ${__dirname}   | ${true}        | ${{ filename: __dirname, text: '', errorCode: 'EISDIR' }}
        ${'not_found'} | ${true}        | ${{ filename: r(__dirname, 'not_found'), text: '', errorCode: 'ENOENT' }}
        ${__filename}  | ${true}        | ${oc({ filename: __filename, text: expect.stringMatching(/.+\n/) })}
        ${__filename}  | ${false}       | ${oc({ filename: __filename, text: expect.stringMatching(/.+\n/) })}
    `('readFile handle $filename $handleNotFound', async ({ filename, handleNotFound, expected }) => {
        filename = r(__dirname, filename);
        await expect(readFileInfo(filename, undefined, handleNotFound)).resolves.toEqual(expected);
    });

    test.each`
        filename       | expected
        ${__dirname}   | ${IOError}
        ${'not_found'} | ${IOError}
    `('readFile errors $filename', async ({ filename, expected }) => {
        filename = r(__dirname, filename);
        await expect(readFileInfo(filename, undefined, false)).rejects.toThrow(expected);
    });
});
