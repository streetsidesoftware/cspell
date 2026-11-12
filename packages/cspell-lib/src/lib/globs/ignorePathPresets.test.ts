import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ENV_CSPELL_GLOB_ROOT } from '../Settings/constants.js';
import { calcIgnorePaths, findIgnorePathPreset } from './ignorePathPresets.js';

const root = path.resolve('/repo');

describe('ignorePathPresets', () => {
    beforeEach(() => {
        process.env[ENV_CSPELL_GLOB_ROOT] = root;
    });

    afterEach(() => {
        delete process.env[ENV_CSPELL_GLOB_ROOT];
    });

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
        file                       | runFrom                       | expected
        ${'.git/config'}           | ${'.git'}                     | ${undefined}
        ${'.git/objects/ab/cdef'}  | ${'.git'}                     | ${undefined}
        ${'.git/objects/ab/cdef'}  | ${'.git/objects'}             | ${undefined}
        ${'.git/config'}           | ${'src'}                      | ${undefined}
        ${'node_modules/pkg/.git'} | ${'node_modules/pkg'}         | ${'git'}
        ${'node_modules/pkg/a.md'} | ${'node_modules/pkg'}         | ${undefined}
        ${'sub/.git/config'}       | ${'sub/.git'}                 | ${undefined}
        ${'sub/.git/config'}       | ${'sub'}                      | ${'git'}
        ${'.git/modules/sub/HEAD'} | ${'.git/modules/sub'}         | ${undefined}
        ${'.git/modules/sub/HEAD'} | ${'.git/modules/sub/objects'} | ${undefined}
    `('only the path below the root counts: $file from $runFrom', ({ file, runFrom, expected }) => {
        process.env[ENV_CSPELL_GLOB_ROOT] = path.join(root, runFrom);
        expect(findIgnorePathPreset(path.join(root, file), undefined)).toBe(expected);
    });

    test('the root defaults to the current working directory', () => {
        delete process.env[ENV_CSPELL_GLOB_ROOT];
        expect(findIgnorePathPreset(path.resolve('.git/config'), undefined)).toBe('git');
        expect(findIgnorePathPreset(path.resolve('.git/COMMIT_EDITMSG'), undefined)).toBe(undefined);
    });

    test.each`
        settings                                                         | expected
        ${{}}                                                            | ${[gitGlob()]}
        ${{ ignorePaths: ['dist/'] }}                                    | ${['dist/', gitGlob()]}
        ${{ ignorePaths: ['dist/'], ignorePathPresets: {} }}             | ${['dist/', gitGlob()]}
        ${{ ignorePaths: ['dist/'], ignorePathPresets: { git: false } }} | ${['dist/']}
        ${{ ignorePathPresets: { git: false } }}                         | ${[]}
    `('calcIgnorePaths $settings', ({ settings, expected }) => {
        expect(calcIgnorePaths(settings)).toEqual(expected);
    });
});

function gitGlob() {
    return { glob: '/**/.git/!(EDIT_DESCRIPTION|*MSG)', root, source: 'ignorePathPresets.git' };
}

// cspell:ignore cdef EDITMSG PULLREQ
