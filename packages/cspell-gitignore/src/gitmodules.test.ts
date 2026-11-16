import { describe, expect, test } from 'vitest';

import { parseSubmodulePaths, readSubmoduleFolders } from './gitmodules.js';

describe('gitmodules', () => {
    test.each`
        content                                                           | expected
        ${''}                                                             | ${[]}
        ${'[submodule "a"]\n\tpath = vendor/a\n\turl = ../a.git\n'}       | ${['vendor/a']}
        ${'[submodule "a"]\r\n\tpath = vendor/a\r\n'}                     | ${['vendor/a']}
        ${'[submodule "a"]\n\tPath=vendor/a ; comment\n'}                 | ${['vendor/a']}
        ${'[submodule "a"]\n\tpath = "vendor/my \\"lib\\"" # comment\n'}  | ${['vendor/my "lib"']}
        ${'[submodule "a"]\n\tpath = a\n[submodule "b"]\n\tpath = b/c\n'} | ${['a', 'b/c']}
        ${'[other]\n\tpath = a\n[submodule "b"]\n\tpath = b\n'}           | ${['b']}
        ${'# path = a\n[submodule "b"]\n\turl = b\n'}                     | ${[]}
    `('parseSubmodulePaths $content', ({ content, expected }) => {
        expect(parseSubmodulePaths(content)).toEqual(expected);
    });

    test('readSubmoduleFolders without .gitmodules', async () => {
        const folders = await readSubmoduleFolders(new URL('not-found/', import.meta.url));
        expect([...folders]).toEqual([]);
    });
});
