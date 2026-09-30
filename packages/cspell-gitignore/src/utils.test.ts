import { describe, expect, test } from 'vitest';

import { isParentOf } from './utils.js';

describe('utils', () => {
    test.each`
        parent                               | child                                    | expected
        ${'file:///a/b/'}                    | ${'file:///a/b/c/d.txt'}                 | ${true}
        ${'file:///a/b'}                     | ${'file:///a/b/c/d.txt'}                 | ${true}
        ${'file:///a/b/'}                    | ${'file:///a/bc/d.txt'}                  | ${false}
        ${'file:///a/b/'}                    | ${'file:///a/'}                          | ${false}
        ${'vscode-vfs://github/owner/repo/'} | ${'vscode-vfs://github/owner/repo/src/'} | ${true}
        ${'vscode-vfs://github/owner/repo/'} | ${'vscode-vfs://gitlab/owner/repo/src/'} | ${true}
        ${'file:///owner/repo/'}             | ${'vscode-vfs://github/owner/repo/src/'} | ${true}
        ${'vscode-vfs://github/owner/repo/'} | ${'file:///owner/repo/src/'}             | ${true}
    `('isParentOf compares paths only: $parent $child', ({ parent, child, expected }) => {
        expect(isParentOf(parent, new URL(child))).toBe(expected);
    });
});
