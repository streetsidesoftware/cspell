import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { toFileDirURL } from '@cspell/url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { getFileSystem } from '../fileSystem.js';
import { findNestedWorktrees } from './nestedWorktrees.js';

describe('findNestedWorktrees', () => {
    let tmp = '';
    let repo = '';

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-nested-worktrees-'));
        repo = path.join(tmp, 'repo');
        const outside = path.join(tmp, 'outside');

        await write(repo, '.git/HEAD', 'ref: refs/heads/main\n');
        // A record with an absolute path, as `git worktree add` writes by default.
        await addWorktree(repo, 'feat', path.join(repo, '.worktrees/feat'), 'absolute');
        // A record with a relative path, as written with `worktree.useRelativePaths`.
        await addWorktree(repo, 'wt1', path.join(repo, 'wt (1)'), 'relative');
        // A worktree inside another worktree.
        await addWorktree(repo, 'inner', path.join(repo, '.worktrees/feat/inner'), 'absolute');
        await addWorktree(repo, 'outside', outside, 'absolute');
        // A worktree deleted without git: its record is left behind.
        await write(repo, '.git/worktrees/gone/gitdir', path.join(repo, 'gone/.git') + '\n');
        await write(repo, '.git/worktrees/notes.txt', 'not a record\n');
        // A submodule also has a `.git` file, but it is not a worktree.
        await write(repo, 'sub/.git', 'gitdir: ../.git/modules/sub\n');
        await write(repo, '.git/modules/sub/HEAD', 'ref: refs/heads/main\n');
        await write(repo, 'src/code.ts', '\n');
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    test.each`
        root                    | expected
        ${'.'}                  | ${['.worktrees/feat', '.worktrees/feat/inner', 'wt (1)']}
        ${'.worktrees'}         | ${['.worktrees/feat', '.worktrees/feat/inner']}
        ${'.worktrees/feat'}    | ${['.worktrees/feat/inner']}
        ${'wt (1)'}             | ${[]}
        ${'src'}                | ${[]}
        ${'sub'}                | ${[]}
        ${'.worktrees/feat/in'} | ${[]}
    `('findNestedWorktrees $root', async ({ root, expected }) => {
        const found = await findNestedWorktrees(toFileDirURL(path.join(repo, root)), getFileSystem());
        const rootUrl = toFileDirURL(repo);
        const folders = found.map((url) => decodeURIComponent(url.href.slice(rootUrl.href.length)).replace(/\/$/, ''));
        expect(folders.sort()).toEqual(expected);
    });

    test('a folder outside a repository', async () => {
        expect(await findNestedWorktrees(toFileDirURL(path.join(tmp, 'outside-repo')), getFileSystem())).toEqual([]);
    });
});

/**
 * Write the files git writes for a linked worktree.
 */
async function addWorktree(repo: string, name: string, folder: string, kind: 'absolute' | 'relative') {
    const recordDir = path.join(repo, '.git/worktrees', name);
    const dotGit = path.join(folder, '.git');
    const toRecord = kind === 'absolute' ? dotGit : path.relative(recordDir, dotGit);
    const toRecordDir = kind === 'absolute' ? recordDir : path.relative(folder, recordDir);
    await write(recordDir, 'gitdir', toPosix(toRecord) + '\n');
    await write(recordDir, 'commondir', '../..\n');
    await write(recordDir, 'HEAD', 'ref: refs/heads/' + name + '\n');
    await write(folder, '.git', 'gitdir: ' + toPosix(toRecordDir) + '\n');
}

async function write(dir: string, file: string, content: string) {
    const filePath = path.join(dir, file);
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, content);
}

function toPosix(p: string): string {
    return p.split(path.sep).join('/');
}

// cspell:ignore commondir
