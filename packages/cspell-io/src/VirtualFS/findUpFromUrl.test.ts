import { pathToFileURL } from 'node:url';

import { describe, expect, test, vi } from 'vitest';

import { getDefaultVFileSystemCore } from '../CVirtualFS.js';
import { findUpFromUrl } from './findUpFromUrl.js';

const cwdURL = pathToFileURL('./');

const __fileURL = new URL(import.meta.url);
const __dirURL = new URL('.', __fileURL);
const packageRoot = new URL('../..', __dirURL);
const reposRoot = new URL('../..', packageRoot);

const fs = getDefaultVFileSystemCore();

describe('findUpFromUrl', () => {
    test('should find the file in the current directory', async () => {
        const result = await findUpFromUrl('README.md', __dirURL, { fs });
        expect(result).toEqual(new URL('README.md', packageRoot));
    });

    test('should find the `samples` in the current directory', async () => {
        const result = await findUpFromUrl('samples', __dirURL, { fs, type: 'directory' });
        expect(result).toEqual(resolve(packageRoot, './samples'));
    });

    test('should find the directory in the current directory', async () => {
        const result = await findUpFromUrl('samples', packageRoot, { fs, type: 'directory' });
        expect(result).toEqual(resolve(packageRoot, './samples'));
    });

    test('should stop searching at the specified directory', async () => {
        const result = await findUpFromUrl('eslint.config.mjs', __dirURL, { fs, stopAt: reposRoot });
        expect(result).toEqual(new URL('eslint.config.mjs', reposRoot));
    });

    test('should stop searching at the specified directory', async () => {
        const result = await findUpFromUrl('eslint.config.mjs', __dirURL, { fs, stopAt: packageRoot });
        expect(result).toBeUndefined();
    });

    test('should return undefined if the file or directory is not found', async () => {
        const result = await findUpFromUrl('nonexistent.txt', __dirURL, { fs });
        expect(result).toBeUndefined();
    });

    test('using a predicate', async () => {
        const predicate = vi.fn((dir: URL) => (dir.href === packageRoot.href ? new URL('found', dir) : undefined));
        const result = await findUpFromUrl(predicate, __dirURL, { fs });
        expect(result).toStrictEqual(new URL('found', packageRoot));
    });

    test.each`
        name                           | cwd          | expected
        ${'README.md'}                 | ${undefined} | ${resolve(packageRoot, 'README.md')}
        ${'README.md'}                 | ${'../'}     | ${resolve(reposRoot, 'README.md')}
        ${['samples', 'package.json']} | ${__dirURL}  | ${resolve(packageRoot, 'package.json')}
    `('findUp $name $cwd', async ({ name, cwd, expected }) => {
        const url = cwd instanceof URL ? cwd : cwd ? pathToFileURL(cwd) : cwdURL;
        const result = await findUpFromUrl(name, url, { fs });
        expect(result).toEqual(expected);
    });
});

function resolve(root: URL, ...parts: string[]) {
    return new URL(parts.join('/'), root);
}
