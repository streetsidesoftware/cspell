import { existsSync, promises as fsp } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import * as path from 'node:path';

import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { createTempFolder } from '../test/test.helper.js';
import { createFolderLookup } from './folderOnDisk.js';

vi.mock('node:fs/promises', async (importOriginal) => {
    const fsPromises = await importOriginal<typeof import('node:fs/promises')>();
    return { ...fsPromises, readdir: vi.fn(fsPromises.readdir), stat: vi.fn(fsPromises.stat) };
});

const nfdName = 'Cafe\u0301';
const nfcName = 'Caf\u00E9';

describe('createFolderLookup', () => {
    let tmp = '';
    let ignoresCase = false;
    let ignoresUnicodeForm = false;

    beforeAll(async () => {
        tmp = await createTempFolder(import.meta.url);
        await fsp.mkdir(path.join(tmp, 'Proj/sub'), { recursive: true });
        await fsp.mkdir(path.join(tmp, nfdName));
        await fsp.writeFile(path.join(tmp, 'Proj/file.txt'), 'text\n');
        await fsp.symlink(path.join(tmp, 'Proj'), path.join(tmp, 'link'), 'junction');
        ignoresCase = existsSync(path.join(tmp, 'proj'));
        ignoresUnicodeForm = existsSync(path.join(tmp, nfcName));
    });

    beforeEach(() => {
        vi.mocked(readdir).mockClear();
        vi.mocked(stat).mockClear();
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
    `('an existing folder keeps its spelling: $folder', async ({ folder }) => {
        expect(await createFolderLookup().find(path.join(tmp, folder))).toBe(path.resolve(tmp, folder));
    });

    test('a relative folder is resolved against the current directory', async () => {
        expect(await createFolderLookup().find('.')).toBe(process.cwd());
    });

    test.each`
        folder
        ${'missing'}
        ${'Proj/file.txt'}
        ${'Proj/file.txt/sub'}
    `('not an existing folder: $folder', async ({ folder }) => {
        expect(await createFolderLookup().find(path.join(tmp, folder))).toBeUndefined();
    });

    test.for([
        ['proj/SUB', 'Proj/sub'],
        ['LINK/sub', 'link/sub'],
    ])('a folder in another letter case is spelled as listed: %s', async ([folder, expected], { skip }) => {
        skip(!ignoresCase, 'the file system matches letter case');
        expect(await createFolderLookup().find(path.join(tmp, folder))).toBe(path.resolve(tmp, expected));
    });

    test('a folder in another Unicode form is spelled as listed', async ({ skip }) => {
        skip(!ignoresUnicodeForm, 'the file system matches Unicode form');
        expect(await createFolderLookup().find(path.join(tmp, nfcName))).toBe(path.join(tmp, nfdName));
    });

    test('the current directory and its parents are known without touching the file system', async () => {
        const lookup = createFolderLookup();
        expect(await lookup.find('.')).toBe(process.cwd());
        expect(await lookup.find('..')).toBe(path.dirname(process.cwd()));
        expect(stat).not.toHaveBeenCalled();
        expect(readdir).not.toHaveBeenCalled();
    });

    test('a lookup only lists the folders below the ones already found', async () => {
        const lookup = createFolderLookup();
        await lookup.find(path.join(tmp, 'Proj'));
        vi.mocked(readdir).mockClear();

        expect(await lookup.find(path.join(tmp, 'Proj/sub'))).toBe(path.join(tmp, 'Proj', 'sub'));
        expect(readdir).toHaveBeenCalledTimes(1);
        expect(readdir).toHaveBeenCalledWith(path.join(tmp, 'Proj'));
    });

    test('a folder found in another letter case lets the next lookup list only below it', async ({ skip }) => {
        skip(!ignoresCase, 'the file system matches letter case');
        const lookup = createFolderLookup();
        await lookup.find(path.join(tmp, 'PROJ'));
        vi.mocked(readdir).mockClear();

        expect(await lookup.find(path.join(tmp, 'PROJ/SUB'))).toBe(path.join(tmp, 'Proj', 'sub'));
        expect(readdir).toHaveBeenCalledTimes(1);
        expect(readdir).toHaveBeenCalledWith(path.join(tmp, 'Proj'));
    });

    test('a folder found in another letter case is known the next time', async ({ skip }) => {
        skip(!ignoresCase, 'the file system matches letter case');
        const lookup = createFolderLookup();
        await lookup.find(path.join(tmp, 'PROJ/SUB'));
        vi.mocked(readdir).mockClear();
        vi.mocked(stat).mockClear();

        expect(await lookup.find(path.join(tmp, 'PROJ/SUB'))).toBe(path.join(tmp, 'Proj', 'sub'));
        expect(await lookup.find(path.join(tmp, 'Proj/sub'))).toBe(path.join(tmp, 'Proj', 'sub'));
        expect(stat).not.toHaveBeenCalled();
        expect(readdir).not.toHaveBeenCalled();
    });
});
