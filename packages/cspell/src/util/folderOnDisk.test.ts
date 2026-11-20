import { existsSync, promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { findFolderOnDisk } from './folderOnDisk.js';

const nfdName = 'Café';
const nfcName = 'Café';

describe('findFolderOnDisk', () => {
    let tmp = '';
    let ignoresCase = false;
    let ignoresUnicodeForm = false;

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-folder-on-disk-'));
        await fsp.mkdir(path.join(tmp, 'Proj/sub'), { recursive: true });
        await fsp.mkdir(path.join(tmp, nfdName));
        await fsp.writeFile(path.join(tmp, 'Proj/file.txt'), 'text\n');
        await fsp.symlink(path.join(tmp, 'Proj'), path.join(tmp, 'link'), 'junction');
        ignoresCase = existsSync(path.join(tmp, 'proj'));
        ignoresUnicodeForm = existsSync(path.join(tmp, nfcName));
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    test.each`
        folder
        ${'Proj'}
        ${'Proj/sub'}
        ${'Proj/sub/'}
        ${'link/sub'}
    `('an existing folder keeps its spelling: $folder', ({ folder }) => {
        expect(findFolderOnDisk(path.join(tmp, folder))).toBe(path.resolve(tmp, folder));
    });

    test('a relative folder is resolved against the current directory', () => {
        expect(findFolderOnDisk('.')).toBe(process.cwd());
    });

    test.each`
        folder
        ${'missing'}
        ${'Proj/file.txt'}
        ${'Proj/file.txt/sub'}
    `('not an existing folder: $folder', ({ folder }) => {
        expect(findFolderOnDisk(path.join(tmp, folder))).toBeUndefined();
    });

    test.for([
        ['proj/SUB', 'Proj/sub'],
        ['LINK/sub', 'link/sub'],
    ])('a folder in another letter case is spelled as listed: %s', ([folder, expected], { skip }) => {
        skip(!ignoresCase, 'the file system matches letter case');
        expect(findFolderOnDisk(path.join(tmp, folder))).toBe(path.resolve(tmp, expected));
    });

    test('a folder in another Unicode form is spelled as listed', ({ skip }) => {
        skip(!ignoresUnicodeForm, 'the file system matches Unicode form');
        expect(findFolderOnDisk(path.join(tmp, nfcName))).toBe(path.join(tmp, nfdName));
    });
});
