import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { toFileDirURL } from '@cspell/url';
import { GlobMatcher } from 'cspell-glob';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { calcIgnorePathGlobs, isIgnoredByPresets } from './ignorePathPresets.js';

const root = path.resolve('/repo');
const rootUrl = toDirUrl(root);
const gitGlobs = [
    { glob: '/**/.git/!(*MSG|EDIT_DESCRIPTION|worktrees)', source: 'ignorePathPresets.git' },
    { glob: '/**/.git/worktrees/*/!(*MSG|EDIT_DESCRIPTION)', source: 'ignorePathPresets.git' },
];

const gitPresetFiles = [
    'src/code.ts',
    'wt/.git',
    '.git',
    '.git/config',
    '.git/objects/ab/cdef0123',
    '.git/COMMIT_EDITMSG',
    '.git/EDIT_DESCRIPTION',
    '.git/worktrees/wt/COMMIT_EDITMSG',
    '.git/worktrees/wt/HEAD',
    '.git/worktrees/wt/logs/x-MSG',
    '.git/worktrees/wt/x/COMMIT_EDITMSG',
    '.git/worktrees/COMMIT_EDITMSG',
    '.git/worktrees/HEAD',
    '.git/modules/libs/a/MERGE_MSG',
    '.git/refs/heads/fix-MSG',
    '.git/refs-MSG/heads/main',
    'nested/clone/.git/HEAD',
    'nested/clone/.git/COMMIT_EDITMSG',
    '.gitignore',
    '.github/workflows/ci.yml',
    '..git/config',
];

describe('ignorePathPresets', () => {
    test.each`
        file                                    | presets           | expected
        ${'src/code.ts'}                        | ${undefined}      | ${false}
        ${'wt/.git'}                            | ${undefined}      | ${true}
        ${'.git'}                               | ${undefined}      | ${true}
        ${'.git/config'}                        | ${undefined}      | ${true}
        ${'.git/HEAD'}                          | ${undefined}      | ${true}
        ${'.git/objects/ab/cdef0123'}           | ${undefined}      | ${true}
        ${'.git/hooks/commit-msg'}              | ${undefined}      | ${true}
        ${'.git/COMMIT_EDITMSG'}                | ${undefined}      | ${false}
        ${'.git/MERGE_MSG'}                     | ${undefined}      | ${false}
        ${'.git/TAG_EDITMSG'}                   | ${undefined}      | ${false}
        ${'.git/NOTES_EDITMSG'}                 | ${undefined}      | ${false}
        ${'.git/PULLREQ_EDITMSG'}               | ${undefined}      | ${false}
        ${'.git/EDIT_DESCRIPTION'}              | ${undefined}      | ${false}
        ${'.git/worktrees/wt/COMMIT_EDITMSG'}   | ${undefined}      | ${false}
        ${'.git/worktrees/wt/HEAD'}             | ${undefined}      | ${true}
        ${'.git/modules/libs/a/MERGE_MSG'}      | ${undefined}      | ${true}
        ${'.git/refs/heads/fix-MSG'}            | ${undefined}      | ${true}
        ${'.git/worktrees/wt/logs/x-MSG'}       | ${undefined}      | ${true}
        ${'.git/worktrees/wt/x/COMMIT_EDITMSG'} | ${undefined}      | ${true}
        ${'.git/worktrees/COMMIT_EDITMSG'}      | ${undefined}      | ${false}
        ${'.git/worktrees/HEAD'}                | ${undefined}      | ${false}
        ${'.git/refs-MSG/heads/main'}           | ${undefined}      | ${false}
        ${'.git/modules/libs/a/config'}         | ${undefined}      | ${true}
        ${'nested/clone/.git/HEAD'}             | ${undefined}      | ${true}
        ${'nested/clone/.git/COMMIT_EDITMSG'}   | ${undefined}      | ${false}
        ${'nested/clone/src/code.ts'}           | ${undefined}      | ${false}
        ${'.gitignore'}                         | ${undefined}      | ${false}
        ${'.github/workflows/ci.yml'}           | ${undefined}      | ${false}
        ${'src/.git-blame-ignore-revs'}         | ${undefined}      | ${false}
        ${'..git/config'}                       | ${undefined}      | ${false}
        ${'wt/.git'}                            | ${{}}             | ${true}
        ${'.git/config'}                        | ${{ git: true }}  | ${true}
        ${'wt/.git'}                            | ${{ git: false }} | ${false}
        ${'.git/config'}                        | ${{ git: false }} | ${false}
    `('isIgnoredByPresets $file $presets', ({ file, presets, expected }) => {
        expect(isIgnoredByPresets(toUrl(root, file), rootUrl, { ignorePathPresets: presets })).toBe(expected);
    });

    test.each`
        fileRoot         | file                                       | expected
        ${'super/sub'}   | ${'super/.git/modules/sub/COMMIT_EDITMSG'} | ${false}
        ${'super/sub'}   | ${'super/.git/modules/sub/config'}         | ${false}
        ${'super/sub'}   | ${'super/.git'}                            | ${false}
        ${'super/sub'}   | ${'super/sub/.git'}                        | ${true}
        ${'super/sub'}   | ${'super/sub/.git/config'}                 | ${true}
        ${'main/wt'}     | ${'main/.git/worktrees/wt/COMMIT_EDITMSG'} | ${false}
        ${'main/.git'}   | ${'main/.git/config'}                      | ${false}
        ${'main/.git'}   | ${'main/.git/hooks/commit-msg'}            | ${false}
        ${'main/.git'}   | ${'main/.git/modules/a/config'}            | ${false}
        ${'main/.git'}   | ${'main/.git/x/.git'}                      | ${true}
        ${'main/.git/x'} | ${'main/.git/x/.git/config'}               | ${true}
    `('isIgnoredByPresets $file with root $fileRoot', ({ fileRoot, file, expected }) => {
        const r = path.join(root, fileRoot);
        expect(isIgnoredByPresets(toUrl(root, file), toDirUrl(r), {})).toBe(expected);
    });

    test.each`
        file                                           | fileRoot                    | expected
        ${'vscode-fs://host/repo/.git/config'}         | ${'vscode-fs://host/repo/'} | ${true}
        ${'vscode-fs://host/repo/wt/.git'}             | ${'vscode-fs://host/repo/'} | ${true}
        ${'vscode-fs://host/repo/.git/COMMIT_EDITMSG'} | ${'vscode-fs://host/repo/'} | ${false}
        ${'vscode-fs://host/repo/src/code.ts?x=.git'}  | ${'vscode-fs://host/repo/'} | ${false}
        ${'vscode-fs://host/other/.git/config'}        | ${'vscode-fs://host/repo/'} | ${false}
        ${'vscode-fs://other/repo/.git/config'}        | ${'vscode-fs://host/repo/'} | ${false}
        ${'vscode-fs://host/repo/.git/config'}         | ${'file:///repo/'}          | ${false}
        ${'file:///repo/.git/config'}                  | ${'vscode-fs://host/repo/'} | ${false}
        ${'file:///repo/.git/config'}                  | ${'file:///repo'}           | ${true}
        ${'file:///repository/.git/config'}            | ${'file:///repo'}           | ${false}
    `('isIgnoredByPresets $file with root $fileRoot', ({ file, fileRoot, expected }) => {
        expect(isIgnoredByPresets(new URL(file), new URL(fileRoot), {})).toBe(expected);
    });

    // The search uses the globs, a single file uses `isIgnoredByPresets`. They must agree.
    test.each(gitPresetFiles)('the globs and isIgnoredByPresets agree on %s', async (file) => {
        const matcher = new GlobMatcher(await calcIgnorePathGlobs({}, rootUrl), { root, cwd: root, mode: 'exclude' });
        const filename = path.join(root, file);
        const globsIgnore = matcher.match(filename) || path.basename(filename) === '.git';
        expect(isIgnoredByPresets(toUrl(root, file), rootUrl, {})).toBe(globsIgnore);
    });

    test.each`
        settings                                 | expected
        ${{}}                                    | ${gitGlobs}
        ${{ ignorePathPresets: {} }}             | ${gitGlobs}
        ${{ ignorePathPresets: { git: true } }}  | ${gitGlobs}
        ${{ ignorePathPresets: { git: false } }} | ${[]}
    `('calcIgnorePathGlobs $settings', async ({ settings, expected }) => {
        expect(await calcIgnorePathGlobs(settings, rootUrl)).toEqual(expected);
    });
});

describe('ignorePathPresets nestedWorktrees', () => {
    // Glob symbols that are allowed in folder names on every platform, and those allowed only outside Windows.
    const worktrees = [
        '.worktrees/feat',
        'wt (1)',
        'a[b]',
        'c{d,e}',
        'f!(g)',
        'h+(i)',
        'j@(k)',
        'l]m',
        'n,o',
        'wt #1',
        '!imp',
        ' lead',
    ];
    const posixWorktrees = ['p*q', 'r?s', 't|u', 'back\\slash', 'trail '];
    const allWorktrees = process.platform === 'win32' ? worktrees : [...worktrees, ...posixWorktrees];
    let tmp = '';
    let repo = '';

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-presets-worktrees-'));
        repo = path.join(tmp, 'repo');
        await fsp.mkdir(path.join(repo, '.git'), { recursive: true });
        for (const [i, folder] of allWorktrees.entries()) {
            const dotGit = path.join(repo, folder, '.git');
            const recordDir = path.join(repo, '.git/worktrees', `wt${i}`);
            await fsp.mkdir(path.dirname(dotGit), { recursive: true });
            await fsp.mkdir(recordDir, { recursive: true });
            await fsp.writeFile(dotGit, `gitdir: ${recordDir}\n`);
            await fsp.writeFile(path.join(recordDir, 'gitdir'), `${dotGit}\n`);
        }
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    test.each`
        presets                       | expected
        ${undefined}                  | ${true}
        ${{ nestedWorktrees: true }}  | ${true}
        ${{ git: false }}             | ${true}
        ${{ nestedWorktrees: false }} | ${false}
    `('calcIgnorePathGlobs with worktrees $presets', async ({ presets, expected }) => {
        const globs = await calcIgnorePathGlobs({ ignorePathPresets: presets }, toFileDirURL(repo));
        const worktreeGlobs = globs.filter((g) => g.source === 'ignorePathPresets.nestedWorktrees');
        expect(worktreeGlobs.length).toBe(expected ? allWorktrees.length : 0);
        expect(globs.filter((g) => g.source === 'ignorePathPresets.git').length).toBe(presets?.git === false ? 0 : 2);
    });

    // The folder names hold glob symbols, so the globs must escape them.
    test.each(allWorktrees)(
        'Validate cspell-glob assumptions: the glob for %s matches only that folder',
        async (folder) => {
            const globs = await calcIgnorePathGlobs({ ignorePathPresets: { git: false } }, toFileDirURL(repo));
            const matcher = new GlobMatcher(globs, { root: repo, cwd: repo, mode: 'exclude' });
            expect(matcher.match(path.join(repo, folder, 'readme.md'))).toBe(true);
            expect(matcher.match(path.join(repo, folder, 'src/code.ts'))).toBe(true);
            expect(matcher.match(path.join(repo, folder + 'x', 'readme.md'))).toBe(false);
            expect(matcher.match(path.join(repo, 'src/code.ts'))).toBe(false);
        },
    );
});

function toUrl(dir: string, file: string): URL {
    return pathToFileURL(path.join(dir, file));
}

function toDirUrl(dir: string): URL {
    return pathToFileURL(dir + path.sep);
}

// cspell:ignore cdef EDITMSG PULLREQ
