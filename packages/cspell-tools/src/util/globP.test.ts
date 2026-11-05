import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { globP } from './globP.ts';

const utilDir = fileURLToPath(new URL('.', import.meta.url));
const srcDir = fileURLToPath(new URL('..', import.meta.url));

describe('globP', () => {
    test('absolute pattern', async () => {
        const result = await globP(join(utilDir, 'globP*.ts'));
        expect(result.sort()).toEqual([join(utilDir, 'globP.test.ts'), join(utilDir, 'globP.ts')]);
    });

    test('relative pattern', async () => {
        const file = relative(process.cwd(), join(utilDir, 'globP.ts'));
        expect(await globP(file)).toEqual([file]);
    });

    test('no match', async () => {
        expect(await globP(join(utilDir, 'not-found-*.ts'))).toEqual([]);
    });

    test('a file matched by several patterns is listed once', async () => {
        const file = join(utilDir, 'globP.ts');
        expect(await globP([file, join(utilDir, 'globP.t?')])).toEqual([file]);
    });

    test('directories are included by default', async () => {
        const result = await globP(join(srcDir, '{app.ts,gzip}'));
        expect(result.sort()).toEqual([join(srcDir, 'app.ts'), join(srcDir, 'gzip')]);
    });

    test('nodir leaves out directories', async () => {
        const result = await globP(join(srcDir, '{app.ts,gzip}'), { nodir: true });
        expect(result).toEqual([relative(process.cwd(), join(srcDir, 'app.ts'))]);
    });

    test('nodir with a relative pattern', async () => {
        const file = relative(process.cwd(), join(utilDir, 'globP.ts'));
        expect(await globP(file, { nodir: true })).toEqual([file]);
    });

    test.each`
        name          | cwd
        ${'absolute'} | ${utilDir}
        ${'relative'} | ${relative(process.cwd(), utilDir)}
        ${'file URL'} | ${new URL('.', import.meta.url)}
    `('results are relative to a $name cwd', async ({ cwd }) => {
        const expected = ['globP.test.ts', 'globP.ts'];
        expect((await globP('globP*.ts', { cwd })).sort()).toEqual(expected);
        expect((await globP('globP*.ts', { cwd, nodir: true })).sort()).toEqual(expected);
    });

    test('cwd with a pattern matching a directory', async () => {
        const cwd = srcDir;
        expect((await globP('{app.ts,gzip}', { cwd })).sort()).toEqual(['app.ts', 'gzip']);
        expect(await globP('{app.ts,gzip}', { cwd, nodir: true })).toEqual(['app.ts']);
    });

    test.each([{ nodir: false }, { nodir: true }])(
        'changing directory during the search does not change the base, $nodir',
        async ({ nodir }) => {
            const start = process.cwd();
            const relativeDir = relative(start, utilDir);
            try {
                const withCwd = globP('globP.ts', { cwd: relativeDir, nodir });
                const withoutCwd = globP(join(relativeDir, 'globP.ts'), { nodir });
                process.chdir(srcDir);
                expect(await withCwd).toEqual(['globP.ts']);
                expect(await withoutCwd).toEqual([join(relativeDir, 'globP.ts')]);
            } finally {
                process.chdir(start);
            }
        },
    );
});

// cspell:ignore nodir
