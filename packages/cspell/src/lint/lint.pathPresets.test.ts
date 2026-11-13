import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { toFileDirURL } from '@cspell/url';
import { calcIgnorePathGlobs, ENV_CSPELL_GLOB_ROOT } from 'cspell-lib';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { LinterCliOptions } from '../options.js';
import { findFiles } from '../util/fileHelper.js';
import { buildGlobMatcher, extractGlobsFromMatcher } from '../util/glob.js';
import { InMemoryReporter } from '../util/InMemoryReporter.js';
import { runLint } from './lint.js';
import { LintRequest } from './LintRequest.js';

const messageFiles = [
    '.git/COMMIT_EDITMSG',
    '.git/EDIT_DESCRIPTION',
    '.git/MERGE_MSG',
    '.git/NOTES_EDITMSG',
    '.git/PULLREQ_EDITMSG',
    '.git/TAG_EDITMSG',
    '.git/worktrees/wt/COMMIT_EDITMSG',
];

const gitFiles = [
    '.git/config',
    '.git/HEAD',
    '.git/modules/sub/COMMIT_EDITMSG',
    '.git/objects/ab/cdef0123',
    '.git/worktrees/wt/HEAD',
    'nested/.git/HEAD',
    'sub/.git',
    'wt/.git',
];

const otherFiles = ['nested/.git/COMMIT_EDITMSG', 'nested/src/code.txt', 'node_modules/pkg/readme.txt', 'src/code.txt'];

const allFiles = [...messageFiles, ...gitFiles, ...otherFiles];

describe('lint with ignorePathPresets', () => {
    let tmp = '';
    let repo = '';

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-lint-presets-'));
        repo = path.join(tmp, 'repo');
        for (const file of allFiles) {
            const filePath = path.join(repo, file);
            await fsp.mkdir(path.dirname(filePath), { recursive: true });
            // Every file has the same unknown word, so the issues show which files were checked.
            await fsp.writeFile(filePath, 'zqxword\n');
        }
        await fsp.writeFile(path.join(repo, 'cspell.json'), '{"version": "0.2"}\n');
        await fsp.writeFile(path.join(repo, 'presets-off.json'), '{"ignorePathPresets": {"git": false}}\n');
        await fsp.writeFile(path.join(repo, 'imports-off.json'), '{"import": ["./presets-off.json"]}\n');
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    afterEach(() => {
        delete process.env[ENV_CSPELL_GLOB_ROOT];
    });

    async function lint(globs: string[], options: LinterCliOptions, configFile = 'cspell.json', runFrom = '') {
        const reporter = new InMemoryReporter();
        const root = path.join(repo, runFrom);
        const config = path.join(repo, configFile);
        const result = await runLint(new LintRequest(globs, { root, config, ...options }, reporter));
        const files = reporter.issues.map((i) => toPosix(path.relative(repo, fileURLToPath(i.uri || ''))));
        return { result, checked: sorted([...new Set(files)]) };
    }

    test('git files are skipped, and message files are checked', async () => {
        const r = await lint(['**'], { dot: true });
        expect(r.checked).toEqual(
            sorted([...messageFiles, 'nested/.git/COMMIT_EDITMSG', 'nested/src/code.txt', 'src/code.txt']),
        );
    });

    test.each`
        config
        ${'presets-off.json'}
        ${'imports-off.json'}
    `('git: false checks git files: $config', async ({ config }) => {
        const r = await lint(['**'], { dot: true }, config);
        expect(r.checked).toEqual(sorted(allFiles.filter((f) => !f.startsWith('node_modules/'))));
    });

    test.each`
        file                                  | expected
        ${'.git/COMMIT_EDITMSG'}              | ${['.git/COMMIT_EDITMSG']}
        ${'.git/MERGE_MSG'}                   | ${['.git/MERGE_MSG']}
        ${'.git/config'}                      | ${[]}
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${['.git/worktrees/wt/COMMIT_EDITMSG']}
        ${'wt/.git'}                          | ${[]}
    `('a file named on the command line: $file', async ({ file, expected }) => {
        expect((await lint([file], {})).checked).toEqual(expected);
        expect((await lint([], { file: [file] })).checked).toEqual(expected);
    });

    test.each`
        options
        ${{}}
        ${{ forceCheck: true }}
    `('the .git file is reported as skipped: $options', async ({ options }) => {
        const r = await lint([], { file: ['wt/.git'], ...options });
        expect(r.checked).toEqual([]);
        expect(r.result.skippedFiles).toBe(1);
    });

    test('a file named on the command line with git: false', async () => {
        const r = await lint(['wt/.git', '.git/config'], {}, 'presets-off.json');
        expect(r.checked).toEqual(['.git/config', 'wt/.git']);
    });

    test('a run started inside a .git folder checks its files', async () => {
        const r = await lint(['**'], { dot: true }, 'cspell.json', '.git');
        expect(r.checked).toEqual(sorted(allFiles.filter((f) => f.startsWith('.git/'))));
    });

    test.each`
        runFrom  | file
        ${'sub'} | ${'.git/modules/sub/COMMIT_EDITMSG'}
        ${'wt'}  | ${'.git/worktrees/wt/COMMIT_EDITMSG'}
    `('a message file outside the root is checked: $file from $runFrom', async ({ runFrom, file }) => {
        const r = await lint([], { file: [path.join(repo, file)] }, 'cspell.json', runFrom);
        expect(r.checked).toEqual([file]);
    });

    test('a run started inside a node_modules folder checks its files', async () => {
        const r = await lint(['**'], { dot: true }, 'cspell.json', 'node_modules/pkg');
        expect(r.checked).toEqual(['node_modules/pkg/readme.txt']);
    });
});

describe('lint with nestedWorktrees', () => {
    // A worktree with a record with an absolute path, and one with a relative path and glob symbols in its name.
    const worktrees = [
        { name: 'feat', folder: '.worktrees/feat', record: (repo: string) => path.join(repo, '.worktrees/feat/.git') },
        { name: 'wt1', folder: 'wt (1)', record: () => '../../../wt (1)/.git' },
    ];
    const worktreeFiles = ['.worktrees/feat/src/code.txt', 'wt (1)/readme.txt'];
    // `wt 1` is not a worktree, and its name is close to `wt (1)`.
    const repoFiles = ['src/code.txt', 'sub/readme.txt', 'wt 1/readme.txt'];
    let tmp = '';
    let repo = '';

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-lint-worktrees-'));
        repo = path.join(tmp, 'repo');
        for (const file of [...worktreeFiles, ...repoFiles]) {
            // Every file has the same unknown word, so the issues show which files were checked.
            await write(file, 'zqxword\n');
        }
        await write('.git/HEAD', 'ref: refs/heads/main\n');
        for (const { name, folder, record } of worktrees) {
            await write(`.git/worktrees/${name}/gitdir`, toPosix(record(repo)) + '\n');
            await write(`.git/worktrees/${name}/commondir`, '../..\n');
            await write(`${folder}/.git`, toPosix(`gitdir: ${path.join(repo, '.git/worktrees', name)}`) + '\n');
        }
        // A submodule is not a worktree, so its files are checked.
        await write('sub/.git', 'gitdir: ../.git/modules/sub\n');
        await write('.git/modules/sub/HEAD', 'ref: refs/heads/main\n');
        await write('cspell.json', '{"version": "0.2"}\n');
        await write('worktrees-off.json', '{"ignorePathPresets": {"nestedWorktrees": false}}\n');
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    async function write(file: string, content: string) {
        const filePath = path.join(repo, file);
        await fsp.mkdir(path.dirname(filePath), { recursive: true });
        await fsp.writeFile(filePath, content);
    }

    async function lint(globs: string[], options: LinterCliOptions, configFile = 'cspell.json', runFrom = '') {
        const reporter = new InMemoryReporter();
        const root = path.join(repo, runFrom);
        const config = path.join(repo, configFile);
        await runLint(new LintRequest(globs, { root, config, ...options }, reporter));
        const files = reporter.issues.map((i) => toPosix(path.relative(repo, fileURLToPath(i.uri || ''))));
        return sorted([...new Set(files)]);
    }

    test('nested worktrees are skipped', async () => {
        expect(await lint(['**/*.txt'], { dot: true })).toEqual(repoFiles);
    });

    test('nestedWorktrees: false checks nested worktrees', async () => {
        expect(await lint(['**/*.txt'], { dot: true }, 'worktrees-off.json')).toEqual(
            sorted([...repoFiles, ...worktreeFiles]),
        );
    });

    test.each(worktreeFiles)('a file in a nested worktree named on the command line: %s', async (file) => {
        // A name on the command line is a glob, so `wt (1)/readme.txt` also matches `wt 1/readme.txt`.
        expect(await lint([file], {})).not.toContain(file);
        expect(await lint([file], {}, 'worktrees-off.json')).toContain(file);
        expect(await lint([], { file: [file] })).toEqual([]);
        expect(await lint([], { file: [file], forceCheck: true })).toEqual([file]);
    });

    // The worktree globs are also the search's ignore globs, so the search never enters a worktree.
    test('Validate tinyglobby assumptions: the search skips the worktrees', async () => {
        const globs = await calcIgnorePathGlobs({}, toFileDirURL(repo));
        const ignore = extractGlobsFromMatcher(buildGlobMatcher(globs, repo, true));
        const found = await findFiles(['**/*.txt'], { root: repo, cwd: repo, ignore, dot: true, nodir: true });
        expect(sorted(found.map((f) => toPosix(path.relative(repo, f))))).toEqual(repoFiles);
    });

    test.each`
        runFrom              | expected
        ${'.worktrees/feat'} | ${['.worktrees/feat/src/code.txt']}
        ${'wt (1)'}          | ${['wt (1)/readme.txt']}
    `('a run started inside a worktree checks its files: $runFrom', async ({ runFrom, expected }) => {
        expect(await lint(['**/*.txt'], { dot: true }, 'cspell.json', runFrom)).toEqual(expected);
    });
});

function sorted(files: string[]): string[] {
    return [...files].sort();
}

function toPosix(p: string): string {
    return p.split(path.sep).join('/');
}

// cspell:ignore commondir EDITMSG nodir PULLREQ zqxword
