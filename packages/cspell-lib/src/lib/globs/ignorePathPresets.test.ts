import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { calcIgnorePaths, findIgnorePathPreset } from './ignorePathPresets.js';

const root = path.resolve('/repo');
const gitGlob = { glob: '**/.git/!(EDIT_DESCRIPTION|*MSG)', source: 'ignorePathPresets.git' };

describe('ignorePathPresets', () => {
    test.each`
        file                                  | presets           | expected
        ${'src/code.ts'}                      | ${undefined}      | ${undefined}
        ${'wt/.git'}                          | ${undefined}      | ${'git'}
        ${'.git'}                             | ${undefined}      | ${'git'}
        ${'.git/config'}                      | ${undefined}      | ${'git'}
        ${'.git/HEAD'}                        | ${undefined}      | ${'git'}
        ${'.git/objects/ab/cdef0123'}         | ${undefined}      | ${'git'}
        ${'.git/hooks/commit-msg'}            | ${undefined}      | ${'git'}
        ${'.git/COMMIT_EDITMSG'}              | ${undefined}      | ${undefined}
        ${'.git/MERGE_MSG'}                   | ${undefined}      | ${undefined}
        ${'.git/TAG_EDITMSG'}                 | ${undefined}      | ${undefined}
        ${'.git/NOTES_EDITMSG'}               | ${undefined}      | ${undefined}
        ${'.git/PULLREQ_EDITMSG'}             | ${undefined}      | ${undefined}
        ${'.git/EDIT_DESCRIPTION'}            | ${undefined}      | ${undefined}
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${undefined}      | ${'git'}
        ${'.git/modules/sub/COMMIT_EDITMSG'}  | ${undefined}      | ${'git'}
        ${'nested/clone/.git/HEAD'}           | ${undefined}      | ${'git'}
        ${'nested/clone/.git/COMMIT_EDITMSG'} | ${undefined}      | ${undefined}
        ${'nested/clone/src/code.ts'}         | ${undefined}      | ${undefined}
        ${'.gitignore'}                       | ${undefined}      | ${undefined}
        ${'.github/workflows/ci.yml'}         | ${undefined}      | ${undefined}
        ${'src/.git-blame-ignore-revs'}       | ${undefined}      | ${undefined}
        ${'..git/config'}                     | ${undefined}      | ${undefined}
        ${'wt/.git'}                          | ${{}}             | ${'git'}
        ${'.git/config'}                      | ${{ git: true }}  | ${'git'}
        ${'wt/.git'}                          | ${{ git: false }} | ${undefined}
        ${'.git/config'}                      | ${{ git: false }} | ${undefined}
    `('findIgnorePathPreset $file $presets', ({ file, presets, expected }) => {
        expect(findIgnorePathPreset(path.join(root, file), presets)).toBe(expected);
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
