import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { beforeAll, describe, expect, test } from 'vitest';

import { findRepoRoot } from './findRepoRoot.js';

const pathTemp = path.join(__dirname, '../temp/findRepoRoot');
const pathClone = path.join(pathTemp, 'clone');
const pathWorktree = path.join(pathClone, 'worktrees/wt');

describe('helpers', () => {
    test.each`
        dir                              | expected
        ${__dirname}                     | ${path.join(__dirname, '../../..')}
        ${new URL('.', import.meta.url)} | ${path.join(__dirname, '../../..')}
        ${'/'}                           | ${undefined}
        ${'stdin:/'}                     | ${undefined}
        ${new URL('stdin:/')}            | ${undefined}
    `('findRepoRoot $dir', async ({ dir, expected }) => {
        const f = await findRepoRoot(dir);
        expect(f ? path.join(f, '.') : f).toEqual(expected);
    });

    describe('git worktrees', () => {
        // A worktree marks its root with a `.git` file, while the clone it belongs to has a
        // `.git` directory. A worktree checked out inside its own clone has both above it.
        beforeAll(async () => {
            await fs.rm(pathTemp, { force: true, recursive: true });
            await fs.mkdir(path.join(pathClone, '.git'), { recursive: true });
            await fs.mkdir(pathWorktree, { recursive: true });
            await fs.writeFile(path.join(pathWorktree, '.git'), 'gitdir: ../../.git/worktrees/wt\n');
        });

        test.each`
            dir             | expected
            ${pathWorktree} | ${pathWorktree}
            ${pathClone}    | ${pathClone}
        `('findRepoRoot $dir', async ({ dir, expected }) => {
            const f = await findRepoRoot(dir);
            expect(f ? path.join(f, '.') : f).toEqual(expected);
        });
    });
});
