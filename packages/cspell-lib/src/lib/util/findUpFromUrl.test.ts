import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test, vi } from 'vitest';

import { findUpFromUrl } from './findUpFromUrl.js';

const __fileURL = new URL(import.meta.url);
const __dirURL = new URL('.', __fileURL);
const packageRoot = new URL('../../..', __dirURL);
const reposRoot = new URL('../..', packageRoot);

describe('findUpFromUrl', () => {
    test('should find the file in the current directory', async () => {
        const result = await findUpFromUrl('README.md', __dirURL);
        expect(result).toEqual(new URL('README.md', packageRoot));
    });

    test('should find the `fixtures` in the current directory', async () => {
        const result = await findUpFromUrl('fixtures', __dirURL, { type: 'directory' });
        expect(result).toEqual(resolve(packageRoot, './fixtures'));
    });

    test('should find the directory in the current directory', async () => {
        const result = await findUpFromUrl('fixtures', packageRoot, { type: 'directory' });
        expect(result).toEqual(resolve(packageRoot, './fixtures'));
    });

    test('should stop searching at the specified directory', async () => {
        const result = await findUpFromUrl('.eslintrc.js', __dirURL, { stopAt: reposRoot });
        expect(result).toEqual(new URL('.eslintrc.js', reposRoot));
    });

    test('should stop searching at the specified directory', async () => {
        const result = await findUpFromUrl('.eslintrc.js', __dirURL, { stopAt: packageRoot });
        expect(result).toBeUndefined();
    });

    test('should return undefined if the file or directory is not found', async () => {
        const result = await findUpFromUrl('nonexistent.txt', __dirURL);
        expect(result).toBeUndefined();
    });

    test('using a predicate', async () => {
        const predicate = vi.fn((dir: URL) => (dir.href === packageRoot.href ? new URL('found', dir) : undefined));
        const result = await findUpFromUrl(predicate, __dirURL);
        expect(result).toStrictEqual(new URL('found', packageRoot));
    });

    test.each`
        name                            | cwd          | expected
        ${'README.md'}                  | ${undefined} | ${resolve(packageRoot, 'README.md')}
        ${'README.md'}                  | ${'..'}      | ${resolve(reposRoot, 'README.md')}
        ${['fixtures', 'package.json']} | ${__dirURL}  | ${resolve(packageRoot, 'package.json')}
    `('findUp $name $cwd', async ({ name, cwd, expected }) => {
        const url = cwd instanceof URL ? cwd : pathToFileURL(path.resolve(cwd || process.cwd()));
        const result = await findUpFromUrl(name, url);
        expect(result).toEqual(expected);
    });
});

function resolve(root: URL, ...parts: string[]) {
    return new URL(parts.join('/'), root);
}
