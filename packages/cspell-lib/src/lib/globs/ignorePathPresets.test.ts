import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { calcIgnorePaths, isIgnoredByPathPresets } from './ignorePathPresets.js';

const root = path.resolve('/repo');
const gitGlob = { glob: '**/.git/!(EDIT_DESCRIPTION|*MSG)', source: 'ignorePathPresets.git' };

describe('ignorePathPresets', () => {
    test.each`
        file                                  | presets           | expected
        ${'src/code.ts'}                      | ${undefined}      | ${false}
        ${'wt/.git'}                          | ${undefined}      | ${true}
        ${'.git'}                             | ${undefined}      | ${true}
        ${'.git/config'}                      | ${undefined}      | ${true}
        ${'.git/HEAD'}                        | ${undefined}      | ${true}
        ${'.git/objects/ab/cdef0123'}         | ${undefined}      | ${true}
        ${'.git/hooks/commit-msg'}            | ${undefined}      | ${true}
        ${'.git/COMMIT_EDITMSG'}              | ${undefined}      | ${false}
        ${'.git/MERGE_MSG'}                   | ${undefined}      | ${false}
        ${'.git/TAG_EDITMSG'}                 | ${undefined}      | ${false}
        ${'.git/NOTES_EDITMSG'}               | ${undefined}      | ${false}
        ${'.git/PULLREQ_EDITMSG'}             | ${undefined}      | ${false}
        ${'.git/EDIT_DESCRIPTION'}            | ${undefined}      | ${false}
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${undefined}      | ${true}
        ${'.git/modules/sub/COMMIT_EDITMSG'}  | ${undefined}      | ${true}
        ${'nested/clone/.git/HEAD'}           | ${undefined}      | ${true}
        ${'nested/clone/.git/COMMIT_EDITMSG'} | ${undefined}      | ${false}
        ${'nested/clone/src/code.ts'}         | ${undefined}      | ${false}
        ${'.gitignore'}                       | ${undefined}      | ${false}
        ${'.github/workflows/ci.yml'}         | ${undefined}      | ${false}
        ${'src/.git-blame-ignore-revs'}       | ${undefined}      | ${false}
        ${'..git/config'}                     | ${undefined}      | ${false}
        ${'wt/.git'}                          | ${{}}             | ${true}
        ${'.git/config'}                      | ${{ git: true }}  | ${true}
        ${'wt/.git'}                          | ${{ git: false }} | ${false}
        ${'.git/config'}                      | ${{ git: false }} | ${false}
    `('isIgnoredByPathPresets $file $presets', ({ file, presets, expected }) => {
        expect(isIgnoredByPathPresets(path.join(root, file), { ignorePathPresets: presets })).toBe(expected);
    });

    test.each`
        settings                                 | expected
        ${{}}                                    | ${[gitGlob]}
        ${{ ignorePathPresets: {} }}             | ${[gitGlob]}
        ${{ ignorePathPresets: { git: true } }}  | ${[gitGlob]}
        ${{ ignorePathPresets: { git: false } }} | ${[]}
    `('calcIgnorePaths $settings', ({ settings, expected }) => {
        expect(calcIgnorePaths(settings)).toEqual(expected);
    });
});

// cspell:ignore cdef EDITMSG PULLREQ
