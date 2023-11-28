import { describe, expect, test, vi } from 'vitest';
import path from 'node:path';
import { findUp } from './findUp.js';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '../../..');
const reposRoot = path.resolve(packageRoot, '../..');
const relPackage = path.relative(packageRoot, __dirname);

const cwd = process.cwd();

describe('findUp', () => {
    test('should find the file in the current directory', async () => {
        const result = await findUp('README.md');
        expect(result).toBe(path.resolve(packageRoot, 'README.md'));
    });

    test('should find the `fixtures` in the current directory', async () => {
        const result = await findUp('fixtures', { type: 'directory' });
        expect(result).toBe(path.resolve(packageRoot, './fixtures'));
    });

    test('should find the directory in the current directory', async () => {
        const result = await findUp('fixtures', { type: 'directory' });
        expect(result).toBe(path.resolve(packageRoot, './fixtures'));
    });

    test('should stop searching at the specified directory', async () => {
        const result = await findUp('missing.txt', { stopAt: reposRoot });
        expect(result).toBeUndefined();
    });

    test('should return undefined if the file or directory is not found', async () => {
        const result = await findUp('nonexistent.txt');
        expect(result).toBeUndefined();
    });

    test('using a predicate', async () => {
        const predicate = vi.fn((dir: string) => (dir === cwd ? dir : 'found'));
        const result = await findUp(predicate, { cwd: __dirname });
        expect(result).toBe('found');
    });

    test.each`
        name                            | cwd                                           | expected
        ${'README.md'}                  | ${undefined}                                  | ${path.resolve(packageRoot, 'README.md')}
        ${'README.md'}                  | ${'..'}                                       | ${path.resolve(reposRoot, 'README.md')}
        ${path.basename(__filename)}    | ${path.join(relPackage, 'deeper/and/deeper')} | ${__filename}
        ${['fixtures', 'package.json']} | ${__dirname}                                  | ${path.resolve(packageRoot, 'package.json')}
    `('findUp $name $cwd', async ({ name, cwd, expected }) => {
        const result = await findUp(name, { cwd });
        expect(result).toBe(expected);
    });
});
