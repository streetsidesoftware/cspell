import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { calcIgnorePathGlobs, isIgnoredByPresets } from './ignorePathPresets.js';

const root = path.resolve('/repo');
const gitGlobs = [
    { glob: '**/.git/!(*MSG|EDIT_DESCRIPTION|worktrees)', source: 'ignorePathPresets.git' },
    { glob: '**/.git/worktrees/*/!(*MSG|EDIT_DESCRIPTION)', source: 'ignorePathPresets.git' },
];

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
        ${'.git/worktrees/wt/COMMIT_EDITMSG'} | ${undefined}      | ${false}
        ${'.git/worktrees/wt/HEAD'}           | ${undefined}      | ${true}
        ${'.git/modules/libs/a/MERGE_MSG'}    | ${undefined}      | ${false}
        ${'.git/modules/libs/a/config'}       | ${undefined}      | ${true}
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
    `('isIgnoredByPresets $file $presets', ({ file, presets, expected }) => {
        expect(isIgnoredByPresets(path.join(root, file), { ignorePathPresets: presets })).toBe(expected);
    });

    test.each`
        file                     | expected
        ${'.git/config'}         | ${true}
        ${'.git/COMMIT_EDITMSG'} | ${false}
        ${'wt/.git'}             | ${true}
    `('isIgnoredByPresets with forward slashes $file', ({ file, expected }) => {
        const filePath = path.join(root, file).split(path.sep).join('/');
        expect(isIgnoredByPresets(filePath, {})).toBe(expected);
    });

    test.each`
        settings                                 | expected
        ${{}}                                    | ${gitGlobs}
        ${{ ignorePathPresets: {} }}             | ${gitGlobs}
        ${{ ignorePathPresets: { git: true } }}  | ${gitGlobs}
        ${{ ignorePathPresets: { git: false } }} | ${[]}
    `('calcIgnorePathGlobs $settings', ({ settings, expected }) => {
        expect(calcIgnorePathGlobs(settings)).toEqual(expected);
    });
});

// cspell:ignore cdef EDITMSG PULLREQ
