import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENV_CSPELL_GLOB_ROOT } from 'cspell-lib';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { LinterCliOptions } from '../options.js';
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
];

const gitFiles = [
    '.git/config',
    '.git/HEAD',
    '.git/objects/ab/cdef0123',
    '.git/worktrees/wt/COMMIT_EDITMSG',
    '.git/worktrees/wt/HEAD',
    'nested/.git/HEAD',
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
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${[]}
        ${'wt/.git'}                          | ${[]}
    `('a file named on the command line: $file', async ({ file, expected }) => {
        expect((await lint([file], {})).checked).toEqual(expected);
        expect((await lint([], { file: [file] })).checked).toEqual(expected);
    });

    test('a file named on the command line with git: false', async () => {
        const r = await lint(['wt/.git', '.git/config'], {}, 'presets-off.json');
        expect(r.checked).toEqual(['.git/config', 'wt/.git']);
    });

    test('a run started inside a .git folder only checks the message files', async () => {
        const r = await lint(['**'], { dot: true }, 'cspell.json', '.git');
        expect(r.checked).toEqual(messageFiles);
    });

    test('a run started inside a node_modules folder checks its files', async () => {
        const r = await lint(['**'], { dot: true }, 'cspell.json', 'node_modules/pkg');
        expect(r.checked).toEqual(['node_modules/pkg/readme.txt']);
    });
});

function sorted(files: string[]): string[] {
    return [...files].sort();
}

function toPosix(p: string): string {
    return p.split(path.sep).join('/');
}

// cspell:ignore EDITMSG PULLREQ zqxword
