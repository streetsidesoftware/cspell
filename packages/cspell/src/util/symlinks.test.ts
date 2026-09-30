import { promises as fsp } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { createSymlinkChecker } from './symlinks.js';

describe('symlinks', () => {
    let tmp = '';
    let root = '';
    let canLinkFiles = true;

    beforeAll(async () => {
        tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'cspell-symlinks-'));
        root = path.join(tmp, 'repo');
        await fsp.mkdir(path.join(tmp, 'target'), { recursive: true });
        await fsp.mkdir(path.join(root, 'sub'), { recursive: true });
        await fsp.writeFile(path.join(tmp, 'target/words.txt'), 'words\n');
        await fsp.writeFile(path.join(root, 'sub/inside.txt'), 'inside\n');
        await fsp.symlink(path.join(tmp, 'target'), path.join(root, 'linked-dir'), 'junction');
        try {
            await fsp.symlink(path.join(tmp, 'target/words.txt'), path.join(root, 'doc.md'), 'file');
            await fsp.symlink(path.join(tmp, 'target/missing.txt'), path.join(root, 'dangling.md'), 'file');
            await fsp.symlink(path.join(root, 'sub/inside.txt'), path.join(root, 'inside-link.md'), 'file');
            await fsp.symlink(path.join(tmp, 'target/words.txt'), path.join(tmp, 'target-link.txt'), 'file');
        } catch {
            // Creating file links can need extra permissions on Windows.
            canLinkFiles = false;
        }
    });

    afterAll(async () => {
        await fsp.rm(tmp, { recursive: true, force: true });
    });

    test.each`
        file                        | expected
        ${'sub/inside.txt'}         | ${false}
        ${'missing.txt'}            | ${false}
        ${'linked-dir/words.txt'}   | ${true}
        ${'linked-dir/missing.txt'} | ${true}
        ${'linked-dir'}             | ${true}
        ${'.'}                      | ${false}
        ${'stdin'}                  | ${false}
        ${'stdin://sub/inside.txt'} | ${false}
    `('isReachedThroughSymlink $file', async ({ file, expected }) => {
        const checker = createSymlinkChecker(root);
        expect(await checker.isReachedThroughSymlink(file)).toBe(expected);
        if (!file.startsWith('stdin')) {
            expect(await checker.isReachedThroughSymlink(path.join(root, file))).toBe(expected);
        }
    });

    test.each`
        file                      | expected
        ${'doc.md'}               | ${true}
        ${'dangling.md'}          | ${true}
        ${'inside-link.md'}       | ${true}
        ${'sub/../doc.md'}        | ${true}
        ${'sub/../inside-link.x'} | ${false}
    `('isReachedThroughSymlink file link $file', async ({ file, expected }) => {
        if (!canLinkFiles) return;
        const checker = createSymlinkChecker(root);
        expect(await checker.isReachedThroughSymlink(file)).toBe(expected);
    });

    test('files outside the root: only the file itself is checked', async () => {
        const checker = createSymlinkChecker(root);
        // The path goes through `repo/linked-dir`, but it is named from outside the root.
        expect(await checker.isReachedThroughSymlink(path.join(tmp, 'target/words.txt'))).toBe(false);
        expect(await checker.isReachedThroughSymlink(path.join(tmp, 'repo2/linked-dir/words.txt'))).toBe(false);
        if (canLinkFiles) {
            expect(await checker.isReachedThroughSymlink(path.join(tmp, 'target-link.txt'))).toBe(true);
        }
    });

    test('links above the root are not checked', async () => {
        const linkedRoot = path.join(tmp, 'linked-root');
        await fsp.symlink(root, linkedRoot, 'junction');
        const checker = createSymlinkChecker(linkedRoot);
        expect(await checker.isReachedThroughSymlink('sub/inside.txt')).toBe(false);
        expect(await checker.isReachedThroughSymlink('linked-dir/words.txt')).toBe(true);
    });

    test.each`
        pattern                      | expected
        ${'**'}                      | ${false}
        ${'**/*.txt'}                | ${false}
        ${'sub/*.txt'}               | ${false}
        ${'sub/inside.txt'}          | ${false}
        ${'linked-dir/*.txt'}        | ${true}
        ${'linked-dir/**'}           | ${true}
        ${'linked-dir/words.txt'}    | ${true}
        ${'./linked-dir/*.txt'}      | ${true}
        ${'sub/../linked-dir/*.txt'} | ${true}
        ${'linked-dir/{a,b}.txt'}    | ${true}
        ${'link*/words.txt'}         | ${false}
        ${'{linked-dir,sub}/*.txt'}  | ${false}
        ${'../target/*.txt'}         | ${false}
    `('isGlobReachedThroughSymlink $pattern', async ({ pattern, expected }) => {
        const checker = createSymlinkChecker(root);
        expect(await checker.isGlobReachedThroughSymlink(pattern)).toBe(expected);
        const absPattern = path.join(root, pattern).replaceAll('\\', '/');
        expect(await checker.isGlobReachedThroughSymlink(absPattern)).toBe(expected);
    });
});
