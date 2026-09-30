import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { ProgressItem } from '@cspell/cspell-types';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { environmentKeys } from '../environment.js';
import type { LinterCliOptions } from '../options.js';
import { InMemoryReporter } from '../util/InMemoryReporter.js';
import { runLint } from './lint.js';
import { LintRequest } from './LintRequest.js';

// cspell:ignore zqxtarget zqxinside

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);

class ProgressReporter extends InMemoryReporter {
    progressItems: ProgressItem[] = [];
    override progress(p: ProgressItem): void {
        super.progress(p);
        this.progressItems.push(p);
    }
}

describe('lint and symbolic links', () => {
    let tmp = '';
    let repo = '';
    let config = '';
    let canLinkFiles = true;

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-lint-symlinks-'));
        repo = path.join(tmp, 'repo');
        await fsp.mkdir(path.join(tmp, 'target'), { recursive: true });
        await fsp.mkdir(path.join(repo, 'sub'), { recursive: true });
        await fsp.mkdir(path.join(repo, 'lists'), { recursive: true });
        await fsp.writeFile(path.join(tmp, 'target/words.txt'), 'zqxtarget\n');
        await fsp.writeFile(path.join(tmp, 'target/list.txt'), '../sub/inside.txt\n');
        await fsp.writeFile(path.join(repo, 'sub/inside.txt'), 'zqxinside\n');
        await fsp.writeFile(
            path.join(repo, 'lists/files.txt'),
            '../doc.md\n../linked-dir/words.txt\n../sub/inside.txt\n',
        );
        config = path.join(repo, 'cspell.json');
        await fsp.writeFile(config, '{"version": "0.2", "ignorePaths": ["lists/**"]}\n');
        await fsp.symlink(path.join(tmp, 'target'), path.join(repo, 'linked-dir'), 'junction');
        try {
            await fsp.symlink(path.join(tmp, 'target/words.txt'), path.join(repo, 'doc.md'), 'file');
            await fsp.symlink(path.join(tmp, 'target/missing.txt'), path.join(repo, 'dangling.md'), 'file');
            await fsp.symlink(path.join(repo, 'sub/inside.txt'), path.join(repo, 'inside-link.md'), 'file');
            await fsp.symlink(path.join(tmp, 'target/list.txt'), path.join(repo, 'lists/linked.txt'), 'file');
        } catch {
            // Creating file links can need extra permissions on Windows.
            canLinkFiles = false;
        }
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    afterEach(() => {
        delete process.env[environmentKeys.CSPELL_FOLLOW_SYMLINKS];
    });

    async function lint(globs: string[], options: LinterCliOptions) {
        const reporter = new ProgressReporter();
        const result = await runLint(new LintRequest(globs, { root: repo, config, ...options }, reporter));
        const words = reporter.issues.map((i) => i.text).sort();
        return { result, words, reporter };
    }

    test.each`
        files                                             | options                                       | fileLinks | words            | expected
        ${['sub/inside.txt']}                             | ${{}}                                         | ${false}  | ${['zqxinside']} | ${oc({ errors: 0, files: 1, skippedFiles: 0 })}
        ${['linked-dir/words.txt']}                       | ${{}}                                         | ${false}  | ${[]}            | ${oc({ errors: 0, files: 1, skippedFiles: 1 })}
        ${['linked-dir/missing.txt']}                     | ${{ mustFindFiles: true }}                    | ${false}  | ${[]}            | ${oc({ errors: 0, files: 1, skippedFiles: 1 })}
        ${['linked-dir/words.txt', 'linked-dir/missing']} | ${{ mustFindFiles: false }}                   | ${false}  | ${[]}            | ${oc({ errors: 0, files: 2, skippedFiles: 2 })}
        ${['linked-dir/words.txt']}                       | ${{ followSymlinks: true }}                   | ${false}  | ${['zqxtarget']} | ${oc({ errors: 0, files: 1, skippedFiles: 0 })}
        ${['linked-dir/words.txt']}                       | ${{ forceCheck: true }}                       | ${false}  | ${[]}            | ${oc({ errors: 1, files: 1 })}
        ${['linked-dir/words.txt']}                       | ${{ forceCheck: true, followSymlinks: true }} | ${false}  | ${['zqxtarget']} | ${oc({ errors: 0, files: 1, skippedFiles: 0 })}
        ${['doc.md']}                                     | ${{}}                                         | ${true}   | ${[]}            | ${oc({ errors: 0, files: 1, skippedFiles: 1 })}
        ${['dangling.md']}                                | ${{ mustFindFiles: true }}                    | ${true}   | ${[]}            | ${oc({ errors: 0, files: 1, skippedFiles: 1 })}
        ${['inside-link.md']}                             | ${{}}                                         | ${true}   | ${[]}            | ${oc({ errors: 0, files: 1, skippedFiles: 1 })}
        ${['doc.md', 'sub/inside.txt']}                   | ${{}}                                         | ${true}   | ${['zqxinside']} | ${oc({ errors: 0, files: 2, skippedFiles: 1 })}
        ${['doc.md']}                                     | ${{ followSymlinks: true }}                   | ${true}   | ${['zqxtarget']} | ${oc({ errors: 0, files: 1, skippedFiles: 0 })}
    `('files: $files $options', async ({ files, options, fileLinks, words, expected }) => {
        if (fileLinks && !canLinkFiles) return;
        const r = await lint([], { files, ...options });
        expect(r.words).toEqual(words);
        expect(r.result).toEqual(expected);
    });

    test.each`
        env        | options                      | words
        ${'true'}  | ${{}}                        | ${['zqxtarget']}
        ${'false'} | ${{}}                        | ${[]}
        ${'true'}  | ${{ followSymlinks: false }} | ${[]}
        ${'false'} | ${{ followSymlinks: true }}  | ${['zqxtarget']}
    `('CSPELL_FOLLOW_SYMLINKS=$env $options', async ({ env, options, words }) => {
        process.env[environmentKeys.CSPELL_FOLLOW_SYMLINKS] = env;
        const r = await lint([], { files: ['linked-dir/words.txt'], ...options });
        expect(r.words).toEqual(words);
    });

    test.each`
        globs                                | options                     | words
        ${['**']}                            | ${{}}                       | ${['zqxinside']}
        ${['linked-dir/*.txt']}              | ${{}}                       | ${[]}
        ${['linked-dir/words.txt']}          | ${{}}                       | ${[]}
        ${['linked-dir']}                    | ${{}}                       | ${[]}
        ${['linked-dir/*.txt']}              | ${{ followSymlinks: true }} | ${[]}
        ${['linked-dir/*.txt', 'sub/*.txt']} | ${{}}                       | ${['zqxinside']}
    `('globs: $globs $options', async ({ globs, options, words }) => {
        const r = await lint(globs, options);
        expect(r.words).toEqual(words);
        // No file in the linked directory is listed, not even as skipped.
        const listed = r.reporter.progressItems.map((p) => p.filename).filter((f) => f.includes('linked-dir'));
        expect(listed).toEqual([]);
    });

    test('file list with entries that are links', async () => {
        const r = await lint([], { fileList: [path.join(repo, 'lists/files.txt')] });
        expect(r.words).toEqual(['zqxinside']);
        expect(r.result).toEqual(oc({ errors: 0 }));
    });

    test.each`
        options                     | words            | errors
        ${{}}                       | ${[]}            | ${1}
        ${{ followSymlinks: true }} | ${['zqxinside']} | ${0}
    `('file list that is a link $options', async ({ options, words, errors }) => {
        if (!canLinkFiles) return;
        const r = await lint([], { fileList: [path.join(repo, 'lists/linked.txt')], ...options });
        expect(r.words).toEqual(words);
        expect(r.result).toEqual(oc({ errors }));
    });

    test.each`
        verbose  | reason
        ${false} | ${undefined}
        ${true}  | ${expect.stringContaining('symbolic link')}
    `('the reason for a skipped link is shown with verbose: $verbose', async ({ verbose, reason }) => {
        const r = await lint([], { files: ['linked-dir/words.txt'], verbose, verboseLevel: verbose ? 1 : 0 });
        const complete = r.reporter.progressItems.filter((p) => p.type === 'ProgressFileComplete');
        expect(complete).toEqual([oc({ processed: false })]);
        expect(complete[0].skippedReason).toEqual(reason);
    });

    test('forceCheck reports an error for a link', async () => {
        const r = await lint([], { files: ['linked-dir/words.txt'], forceCheck: true });
        expect(r.reporter.errors.map((e) => e.message)).toEqual([expect.stringContaining('symbolic link')]);
    });
});
