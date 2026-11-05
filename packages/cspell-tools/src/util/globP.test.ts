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
});

// cspell:ignore nodir
