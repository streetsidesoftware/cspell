import * as path from 'node:path';

import type { GlobDef } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { getGlobMatcherForExcluding, getGlobMatcherForExcludingFilesOnly } from './getGlobMatcher.js';

const root = path.resolve('/project');

function r(...parts: string[]): string {
    return path.join(root, ...parts);
}

describe('getGlobMatcher', () => {
    test.each`
        glob                      | file                          | off      | on
        ${'examples.ts'}          | ${r('a/examples.ts')}         | ${true}  | ${true}
        ${'examples.ts'}          | ${r('examples.ts')}           | ${true}  | ${true}
        ${'examples.ts'}          | ${r('a/examples.ts/b.ts')}    | ${true}  | ${false}
        ${'/src'}                 | ${r('src')}                   | ${true}  | ${true}
        ${'/src'}                 | ${r('src/a.ts')}              | ${true}  | ${false}
        ${'/src'}                 | ${r('a/src/b.ts')}            | ${false} | ${false}
        ${'lib/src'}              | ${r('lib/src')}               | ${true}  | ${true}
        ${'lib/src'}              | ${r('lib/src/a.ts')}          | ${true}  | ${false}
        ${'**/.git'}              | ${r('w/.git')}                | ${true}  | ${true}
        ${'**/.git'}              | ${r('w/.git/NOTE')}           | ${true}  | ${false}
        ${'/src/'}                | ${r('src')}                   | ${false} | ${false}
        ${'/src/'}                | ${r('src/a.ts')}              | ${true}  | ${true}
        ${'/src/'}                | ${r('src/a/b.ts')}            | ${true}  | ${true}
        ${'examples.ts/'}         | ${r('a/examples.ts')}         | ${false} | ${false}
        ${'examples.ts/'}         | ${r('a/examples.ts/b.ts')}    | ${true}  | ${true}
        ${'**/.git/'}             | ${r('w/.git')}                | ${false} | ${false}
        ${'**/.git/'}             | ${r('w/.git/NOTE')}           | ${true}  | ${true}
        ${'src/**'}               | ${r('src')}                   | ${true}  | ${false}
        ${'src/**'}               | ${r('src/a.ts')}              | ${true}  | ${true}
        ${'src/**'}               | ${r('src/a/b.ts')}            | ${true}  | ${true}
        ${'**/.git/**'}           | ${r('w/.git')}                | ${true}  | ${false}
        ${'**/.git/**'}           | ${r('w/.git/NOTE')}           | ${true}  | ${true}
        ${'!src/**'}              | ${r('src')}                   | ${false} | ${false}
        ${'*.md'}                 | ${r('a/b/c.md')}              | ${true}  | ${true}
        ${'*.json'}               | ${r('.vscode/settings.json')} | ${true}  | ${true}
        ${'.cspell.json'}         | ${r('a/.cspell.json')}        | ${true}  | ${true}
        ${'**'}                   | ${r('a/b.ts')}                | ${true}  | ${true}
        ${['*.md', '!README.md']} | ${r('README.md')}             | ${false} | ${false}
        ${['*.md', '!README.md']} | ${r('a.md')}                  | ${true}  | ${true}
        ${['/src', 'src/**']}     | ${r('src')}                   | ${true}  | ${true}
        ${['/src', 'src/**']}     | ${r('src/a.ts')}              | ${true}  | ${true}
        ${['/src', '/src']}       | ${r('src')}                   | ${true}  | ${true}
        ${['/src', '/src']}       | ${r('src/a.ts')}              | ${true}  | ${false}
    `('$glob $file off: $off, on: $on', ({ glob, file, off, on }) => {
        const globs = toGlobDefs(glob, root);
        expect(getGlobMatcherForExcluding(globs).match(file)).toBe(off);
        expect(getGlobMatcherForExcludingFilesOnly(globs).match(file)).toBe(on);
    });

    test.each`
        glob             | file                         | off      | on
        ${'examples.ts'} | ${r('examples.ts')}          | ${false} | ${false}
        ${'examples.ts'} | ${r('examples.ts/sub/a.ts')} | ${false} | ${false}
        ${'examples.ts'} | ${r('sub/x/examples.ts')}    | ${true}  | ${true}
        ${'/a.ts'}       | ${r('a.ts')}                 | ${false} | ${false}
        ${'/a.ts'}       | ${r('sub/a.ts')}             | ${true}  | ${true}
        ${'**/a.ts'}     | ${r('a.ts')}                 | ${true}  | ${true}
    `('globs are relative to their root $glob $file off: $off, on: $on', ({ glob, file, off, on }) => {
        // `examples.ts` is relative to its root, but `**/a.ts` matches the full path.
        const globs = toGlobDefs(glob, r('sub'));
        expect(getGlobMatcherForExcluding(globs).match(file)).toBe(off);
        expect(getGlobMatcherForExcludingFilesOnly(globs).match(file)).toBe(on);
    });

    test.each`
        glob             | file          | off     | on
        ${'${cwd}/src'}  | ${'src'}      | ${true} | ${true}
        ${'${cwd}/src'}  | ${'src/a.ts'} | ${true} | ${false}
        ${'${cwd}/src/'} | ${'src/a.ts'} | ${true} | ${true}
    `('${cwd} $glob $file off: $off, on: $on', ({ glob, file, off, on }) => {
        const globs = toGlobDefs(glob, r('sub'));
        const filename = path.resolve(file);
        expect(getGlobMatcherForExcluding(globs).match(filename)).toBe(off);
        expect(getGlobMatcherForExcludingFilesOnly(globs).match(filename)).toBe(on);
    });

    test('a plain string glob is relative to the current directory', () => {
        expect(getGlobMatcherForExcludingFilesOnly('/src').match(path.resolve('src'))).toBe(true);
        expect(getGlobMatcherForExcludingFilesOnly('/src').match(path.resolve('src/a.ts'))).toBe(false);
        expect(getGlobMatcherForExcludingFilesOnly('/src/').match(path.resolve('src/a.ts'))).toBe(true);
    });

    test('matchers are cached', () => {
        const globs = toGlobDefs(['/src', '*.md'], root);
        expect(getGlobMatcherForExcludingFilesOnly(globs)).toBe(getGlobMatcherForExcludingFilesOnly(globs));
        expect(getGlobMatcherForExcludingFilesOnly('/src')).toBe(getGlobMatcherForExcludingFilesOnly('/src'));
        expect(getGlobMatcherForExcludingFilesOnly(globs)).not.toBe(getGlobMatcherForExcluding(globs));
    });
});

function toGlobDefs(glob: string | string[], root: string): GlobDef[] {
    const globs = Array.isArray(glob) ? glob : [glob];
    return globs.map((glob) => ({ glob, root }));
}
