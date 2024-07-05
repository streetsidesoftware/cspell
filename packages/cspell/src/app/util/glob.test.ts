import * as path from 'node:path';

import { GlobMatcher } from 'cspell-glob';
import type { Glob } from 'cspell-lib';
import type { Options as MicromatchOptions } from 'micromatch';
import micromatch from 'micromatch';
import { minimatch } from 'minimatch';
import { describe, expect, test, vi } from 'vitest';

import { calcGlobs, normalizeGlobsToRoot } from './glob.js';

interface MinimatchOptions {
    windowsPathsNoEscape?: boolean;
    allowWindowsEscape?: boolean;
    partial?: boolean;
    dot?: boolean;
    matchBase?: boolean;
    flipNegate?: boolean;
    preserveMultipleSlashes?: boolean;
}

const getStdinResult = {
    value: '',
};

vi.mock('get-stdin', () => {
    return vi.fn(() => Promise.resolve(getStdinResult.value));
});

describe('Validate minimatch assumptions', () => {
    interface TestCase {
        pattern: string;
        file: string;
        options: MinimatchOptions;
        expected: boolean;
    }

    const jsPattern = '*.{js,jsx}';
    const mdPattern = '*.md';
    const nodePattern = '{node_modules,node_modules/**}';
    const nestedPattern = `{**/temp/**,{${jsPattern},${mdPattern},${nodePattern}}}`;

    test.each`
        pattern                | file                                  | options                | expected | comment
        ${'*.json'}            | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${'**/*.json'}         | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${'node_modules'}      | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${''}
        ${'node_modules/'}     | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${'tailing slash (not like .gitignore)'}
        ${'node_modules/'}     | ${'node_modules'}                     | ${{}}                  | ${false} | ${''}
        ${'node_modules/**'}   | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**/*'} | ${'node_modules/package.json'}        | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**'}   | ${'node_modules'}                     | ${{}}                  | ${false} | ${'Note: Minimatch and Micromatch do not give the same result.'}
        ${'node_modules/**/*'} | ${'node_modules'}                     | ${{}}                  | ${false} | ${''}
        ${'*.json'}            | ${'src/package.json'}                 | ${{}}                  | ${false} | ${''}
        ${'*.json'}            | ${'src/package.json'}                 | ${{ matchBase: true }} | ${true}  | ${'check matchBase behavior, option not used by cspell'}
        ${'*.yml'}             | ${'.github/workflows/test.yml'}       | ${{ matchBase: true }} | ${true}  | ${'check matchBase behavior, option not used by cspell'}
        ${'**/*.yml'}          | ${'.github/workflows/test.yml'}       | ${{}}                  | ${false} | ${''}
        ${'**/*.yml'}          | ${'.github/workflows/test.yml'}       | ${{ dot: true }}       | ${true}  | ${'dot is used by default for excludes'}
        ${'{*.json,*.yaml}'}   | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${nestedPattern}       | ${'index.js'}                         | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${nestedPattern}       | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${nestedPattern}       | ${'testing/temp/file.bin'}            | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${'# comment'}         | ${'comment'}                          | ${{}}                  | ${false} | ${'Comments do not match'}
        ${' *.js '}            | ${'index.js'}                         | ${{}}                  | ${false} | ${'Spaces are NOT ignored'}
        ${'!*.js'}             | ${'index.js'}                         | ${{}}                  | ${false} | ${'Negations work'}
        ${'!!*.js'}            | ${'index.js'}                         | ${{}}                  | ${true}  | ${'double negative'}
        ${'{!*.js,*.ts}'}      | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative - do not work (are not expected to)'}
        ${'{!*.js,*.ts}'}      | ${'!index.js'}                        | ${{}}                  | ${true}  | ${'nested negative - exact match'}
        ${'{!*.js,*.ts}'}      | ${'index.ts'}                         | ${{}}                  | ${true}  | ${'nested negative'}
        ${'{*.js,!index.js}'}  | ${'index.js'}                         | ${{}}                  | ${true}  | ${'nested negative does not work as expected'}
        ${'{!!index.js,*.ts}'} | ${'index.js'}                         | ${{}}                  | ${false} | ${'double negative is not a positive'}
        ${'{!index.js,*.ts}'}  | ${'index.js'}                         | ${{}}                  | ${false} | ${''}
        ${'{!index.js,*.js}'}  | ${'index.js'}                         | ${{}}                  | ${true}  | ${'negation does NOT prevent match'}
    `(
        'assume glob "$pattern" matches "$file" is $expected $comment',
        ({ pattern, file, options, expected }: TestCase) => {
            const r = minimatch(file, pattern, options);
            expect(r).toBe(expected);
        },
    );
});

describe('Validate micromatch assumptions', () => {
    interface TestCase {
        pattern: string;
        ignore: string | string[] | undefined;
        file: string;
        options: MicromatchOptions;
        expected: boolean;
    }

    const jsPattern = '*.{js,jsx}';
    const mdPattern = '*.md';
    const nodePattern = '{node_modules,node_modules/**}';
    const nestedPattern = `{**/temp/**,{${jsPattern},${mdPattern},${nodePattern}}}`;

    test.each`
        pattern                | ignore                   | file                                  | options                | expected | comment
        ${'*.json'}            | ${undefined}             | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${'**/*.json'}         | ${undefined}             | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${'node_modules'}      | ${undefined}             | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${''}
        ${'node_modules/'}     | ${undefined}             | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${'tailing slash (not like .gitignore)'}
        ${'node_modules/'}     | ${undefined}             | ${'node_modules'}                     | ${{}}                  | ${false} | ${''}
        ${'node_modules/**'}   | ${undefined}             | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**/*'} | ${undefined}             | ${'node_modules/package.json'}        | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**'}   | ${undefined}             | ${'node_modules'}                     | ${{}}                  | ${true}  | ${'Note: Minimatch and Micromatch do not give the same result.'}
        ${'node_modules/**/*'} | ${undefined}             | ${'node_modules'}                     | ${{}}                  | ${false} | ${''}
        ${'*.json'}            | ${undefined}             | ${'src/package.json'}                 | ${{}}                  | ${false} | ${''}
        ${'*.json'}            | ${undefined}             | ${'src/package.json'}                 | ${{ matchBase: true }} | ${true}  | ${'check matchBase behavior, option not used by cspell'}
        ${'*.yml'}             | ${undefined}             | ${'.github/workflows/test.yml'}       | ${{ matchBase: true }} | ${true}  | ${'check matchBase behavior, option not used by cspell'}
        ${'**/*.yml'}          | ${undefined}             | ${'.github/workflows/test.yml'}       | ${{}}                  | ${false} | ${''}
        ${'**/*.yml'}          | ${undefined}             | ${'.github/workflows/test.yml'}       | ${{ dot: true }}       | ${true}  | ${'dot is used by default for excludes'}
        ${'{*.json,*.yaml}'}   | ${undefined}             | ${'package.json'}                     | ${{}}                  | ${true}  | ${''}
        ${nestedPattern}       | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${nestedPattern}       | ${undefined}             | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${nestedPattern}       | ${undefined}             | ${'testing/temp/file.bin'}            | ${{}}                  | ${true}  | ${'Nested {} is supported'}
        ${'# comment'}         | ${undefined}             | ${'comment'}                          | ${{}}                  | ${false} | ${'Comments do not match'}
        ${' *.js '}            | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${false} | ${'Spaces are NOT ignored'}
        ${'!*.js'}             | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${false} | ${'Negations work'}
        ${'!!*.js'}            | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${true}  | ${'double negative'}
        ${'{!*.js,*.ts}'}      | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative - do not work (are not expected to)'}
        ${'{!*.js,*.ts}'}      | ${undefined}             | ${'!index.js'}                        | ${{}}                  | ${true}  | ${'nested negative - exact match'}
        ${'{!*.js,*.ts}'}      | ${undefined}             | ${'index.ts'}                         | ${{}}                  | ${true}  | ${'nested negative'}
        ${'{*.js,!index.js}'}  | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${true}  | ${'nested negative does not work as expected'}
        ${'{!!index.js,*.ts}'} | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${false} | ${'double negative is not a positive'}
        ${'{!index.js,*.ts}'}  | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${false} | ${''}
        ${'{!index.js,*.js}'}  | ${undefined}             | ${'index.js'}                         | ${{}}                  | ${true}  | ${'negation does NOT prevent match'}
        ${'**'}                | ${'*.json'}              | ${'package.json'}                     | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${'**/*.json'}           | ${'package.json'}                     | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${'node_modules'}        | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${''}
        ${'**'}                | ${'node_modules/'}       | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${'tailing slash (not like .gitignore)'}
        ${'**'}                | ${'node_modules/'}       | ${'node_modules'}                     | ${{}}                  | ${true}  | ${''}
        ${'**'}                | ${'node_modules/**'}     | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${'node_modules/**/*'}   | ${'node_modules/package.json'}        | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${'node_modules/**'}     | ${'node_modules'}                     | ${{}}                  | ${false} | ${'Note: Minimatch and Micromatch do not give the same result.'}
        ${'**'}                | ${'node_modules/**/*'}   | ${'node_modules'}                     | ${{}}                  | ${true}  | ${''}
        ${'**'}                | ${'*.json'}              | ${'src/package.json'}                 | ${{}}                  | ${true}  | ${''}
        ${'**'}                | ${'*.json'}              | ${'src/package.json'}                 | ${{ matchBase: true }} | ${false} | ${'check matchBase behavior, option not used by cspell'}
        ${'**'}                | ${'*.yml'}               | ${'.github/workflows/test.yml'}       | ${{ matchBase: true }} | ${false} | ${'check matchBase behavior, option not used by cspell'}
        ${'**'}                | ${'**/*.yml'}            | ${'.github/workflows/test.yml'}       | ${{}}                  | ${false} | ${'Ignore works against .paths by default.'}
        ${'**'}                | ${'**/*.yml'}            | ${'.github/workflows/test.yml'}       | ${{ dot: true }}       | ${false} | ${'dot is used by default for excludes'}
        ${'**'}                | ${'{*.json,*.yaml}'}     | ${'package.json'}                     | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${nestedPattern}         | ${'index.js'}                         | ${{}}                  | ${false} | ${'Nested {} is supported'}
        ${'**'}                | ${nestedPattern}         | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${'Nested {} is supported'}
        ${'**'}                | ${nestedPattern}         | ${'testing/temp/file.bin'}            | ${{}}                  | ${false} | ${'Nested {} is supported'}
        ${'**'}                | ${'# comment'}           | ${'comment'}                          | ${{}}                  | ${true}  | ${'Comments do not match'}
        ${'**'}                | ${' *.js '}              | ${'index.js'}                         | ${{}}                  | ${true}  | ${'Spaces are NOT ignored'}
        ${'**'}                | ${'!*.js'}               | ${'index.js'}                         | ${{}}                  | ${true}  | ${'Negations work'}
        ${'**'}                | ${'!!*.js'}              | ${'index.js'}                         | ${{}}                  | ${false} | ${'double negative'}
        ${'**'}                | ${'{!*.js,*.ts}'}        | ${'index.js'}                         | ${{}}                  | ${true}  | ${'nested negative'}
        ${'**'}                | ${'{!*.js,*.ts}'}        | ${'index.ts'}                         | ${{}}                  | ${false} | ${'NOT working as expected. index.ts should NOT be allowed'}
        ${'**'}                | ${'{*.js,!index.js}'}    | ${'test.js'}                          | ${{}}                  | ${false} | ${'nested negative ignore does NOT work as expected.'}
        ${'**'}                | ${'{*.js,!index.js}'}    | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative ignore does NOT work as expected.'}
        ${'**'}                | ${['*.js']}              | ${'code.js'}                          | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${['*.js', '!index.js']} | ${'code.js'}                          | ${{}}                  | ${false} | ${''}
        ${'**'}                | ${['*.js', '!index.js']} | ${'index.js'}                         | ${{}}                  | ${false} | ${'Negative ignore DOES NOT WORK'}
        ${'**'}                | ${'{!!index.js,*.ts}'}   | ${'index.js'}                         | ${{}}                  | ${true}  | ${'double negative is not a positive'}
        ${'**'}                | ${'{!index.js,*.ts}'}    | ${'index.js'}                         | ${{}}                  | ${true}  | ${''}
        ${'**'}                | ${'{!index.js,*.js}'}    | ${'index.js'}                         | ${{}}                  | ${false} | ${'negative ignores DO NOT WORK'}
        ${'**'}                | ${['!index.js', '*.js']} | ${'index.js'}                         | ${{}}                  | ${false} | ${'negative ignores DO NOT WORK'}
    `(
        'micromatch glob: "$pattern" ignore: $ignore matches "$file" is $expected $comment',
        ({ pattern, ignore, file, options, expected }: TestCase) => {
            ignore && (options.ignore = ignore);
            const r = micromatch([file], pattern, options);
            expect(r).toEqual(expected ? [file] : []);
        },
    );
});

describe('Validate internal functions', () => {
    test('exclude globs default', () => {
        const ex: string[] = [];
        const r = calcGlobs(ex);
        expect(r).toEqual(
            expect.objectContaining({
                source: 'default',
            }),
        );
    });

    test('exclude globs with space', () => {
        const ex: string[] = ['*/test\\ files/'];
        const r = calcGlobs(ex);
        expect(r).toEqual({ globs: ['*/test files/'], source: 'arguments' });
    });

    test('exclude globs mixed', () => {
        const ex: string[] = ['*/test\\ files/ node_modules', '**/*.dat'];
        const r = calcGlobs(ex);
        expect(r).toEqual({ globs: ['*/test files/', 'node_modules', '**/*.dat'], source: 'arguments' });
    });

    test.each`
        glob                           | root              | exclude  | expectedGlobs
        ${'src/*.json'}                | ${'./project/p2'} | ${true}  | ${['src/*.json', 'src/*.json/**']}
        ${'**'}                        | ${'.'}            | ${true}  | ${['**']}
        ${'*.json'}                    | ${'.'}            | ${true}  | ${['**/*.json', '**/*.json/**']}
        ${'*.json'}                    | ${'./project/p2'} | ${true}  | ${['**/*.json', '**/*.json/**']}
        ${'src/*.json'}                | ${'./project/p2'} | ${true}  | ${['src/*.json', 'src/*.json/**']}
        ${'**/src/*.json'}             | ${'./project/p2'} | ${true}  | ${['**/src/*.json', '**/src/*.json/**']}
        ${'**/src/*.json'}             | ${'.'}            | ${true}  | ${['**/src/*.json', '**/src/*.json/**']}
        ${'/**/src/*.json'}            | ${'.'}            | ${true}  | ${['**/src/*.json', '**/src/*.json/**']}
        ${'src/*.json'}                | ${'./project/p2'} | ${false} | ${['src/*.json']}
        ${'**'}                        | ${'.'}            | ${false} | ${['**']}
        ${'*.json'}                    | ${'.'}            | ${false} | ${['*.json']}
        ${'*.json'}                    | ${'./project/p2'} | ${false} | ${['*.json']}
        ${'src/*.json'}                | ${'./project/p2'} | ${false} | ${['src/*.json']}
        ${'**/src/*.json'}             | ${'./project/p2'} | ${false} | ${['**/src/*.json']}
        ${'**/src/*.json'}             | ${'.'}            | ${false} | ${['**/src/*.json']}
        ${'/**/src/*.json'}            | ${'.'}            | ${false} | ${['**/src/*.json']}
        ${'!../src/*.ts'}              | ${'.'}            | ${false} | ${['!../src/*.ts']}
        ${'../src/*.ts'}               | ${'.'}            | ${false} | ${['../src/*.ts']}
        ${'../src/../test/**/*.ts'}    | ${'.'}            | ${false} | ${['../test/**/*.ts']}
        ${'../src/../../test/**/*.ts'} | ${'.'}            | ${false} | ${['../../test/**/*.ts']}
        ${path.resolve('src/*.json')}  | ${'.'}            | ${false} | ${['src/*.json']}
    `(
        'normalizeGlobsToRoot exclude: $exclude; "$glob" -> "$root" = "$expectedGlobs"',
        ({ glob, root, exclude, expectedGlobs }) => {
            root = path.resolve(root);
            const r = normalizeGlobsToRoot([glob], root, exclude);
            expect(r).toEqual(expectedGlobs);
        },
    );

    interface TestMapGlobToRoot {
        glob: string;
        globRoot: string;
        root: string;
        expectedGlobs: string[];
        file: string;
        expectedToMatch: boolean;
    }

    test.each`
        glob                | globRoot          | root              | expectedGlobs                                                  | file                                | expectedToMatch
        ${'**'}             | ${'.'}            | ${'.'}            | ${['**']}                                                      | ${'./package.json'}                 | ${true}
        ${'*.json'}         | ${'.'}            | ${'.'}            | ${['**/*.json', '**/*.json/**']}                               | ${'./package.json'}                 | ${true}
        ${'*.json'}         | ${'.'}            | ${'.'}            | ${['**/*.json', '**/*.json/**']}                               | ${'./.git/package.json'}            | ${true}
        ${'*.json'}         | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/*.json', 'project/p1/**/*.json/**']}         | ${'./project/p1/package.json'}      | ${true}
        ${'*.json'}         | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/*.json', 'project/p1/**/*.json/**']}         | ${'./project/p1/src/package.json'}  | ${true}
        ${'*.json'}         | ${'.'}            | ${'./project/p2'} | ${['**/*.json', '**/*.json/**']}                               | ${'./project/p2/package.json'}      | ${true}
        ${'**/src/*.json'}  | ${'.'}            | ${'./project/p2'} | ${['**/src/*.json', '**/src/*.json/**']}                       | ${'./project/p2/x/src/config.json'} | ${true}
        ${'**/src/*.json'}  | ${'./project/p1'} | ${'.'}            | ${['**/src/*.json', '**/src/*.json/**']}                       | ${'./project/p1/src/config.json'}   | ${true}
        ${'/**/src/*.json'} | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/src/*.json', 'project/p1/**/src/*.json/**']} | ${'./project/p1/src/config.json'}   | ${true}
    `(
        'mapGlobToRoot exclude "$glob"@"$globRoot" -> "$root" = "$expectedGlobs" $file',
        ({ glob, globRoot, root, expectedGlobs, file, expectedToMatch }: TestMapGlobToRoot) => {
            globRoot = path.resolve(globRoot);
            root = path.resolve(root);
            file = path.resolve(file);
            const globMatcher = new GlobMatcher(glob, {
                root: globRoot,
                mode: 'exclude',
            });
            const patterns = globMatcher.patterns.map((g) => g as Glob);
            const r = normalizeGlobsToRoot(patterns, root, true);
            expect(r).toEqual(expectedGlobs);

            const relToRoot = path.relative(root, file);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
            expect(micromatch.isMatch(relToRoot, expectedGlobs, { dot: true })).toBe(expectedToMatch);
        },
    );

    test.each`
        glob            | globRoot  | root              | expectedGlobs                                  | file                  | expectedToMatch
        ${'src/*.js'}   | ${'./p2'} | ${'./src'}        | ${[]}                                          | ${''}                 | ${false}
        ${'src/*.js'}   | ${'./p2'} | ${'./p2'}         | ${['src/*.js', 'src/*.js/**']}                 | ${'./p2/src/code.js'} | ${true}
        ${'src/*.js'}   | ${'.'}    | ${'./src'}        | ${['*.js', '*.js/**']}                         | ${'./src/code.js'}    | ${true}
        ${'src/*.json'} | ${'.'}    | ${'./project/p2'} | ${['../../src/*.json', '../../src/*.json/**']} | ${'./src/data.json'}  | ${true}
    `(
        'mapGlobToRoot exclude "$glob"@"$globRoot" -> "$root" = "$expectedGlobs" $file',
        ({ glob, globRoot, root, expectedGlobs, file, expectedToMatch }: TestMapGlobToRoot) => {
            globRoot = path.resolve(globRoot);
            root = path.resolve(root);
            file = path.resolve(file);
            const globMatcher = new GlobMatcher(glob, {
                root: globRoot,
                mode: 'exclude',
            });
            const patterns = globMatcher.patterns.map((g) => g as Glob);
            const r = normalizeGlobsToRoot(patterns, root, true);
            expect(r).toEqual(expectedGlobs);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
        },
    );

    test.each`
        glob                | globRoot          | root              | expectedGlobs                   | file                                | expectedToMatch
        ${'*.json'}         | ${'.'}            | ${'.'}            | ${['*.json']}                   | ${'./package.json'}                 | ${true}
        ${'*.json'}         | ${'.'}            | ${'.'}            | ${['*.json']}                   | ${'./.git/package.json'}            | ${false}
        ${'*.json'}         | ${'./project/p1'} | ${'.'}            | ${['project/p1/*.json']}        | ${'./project/p1/package.json'}      | ${true}
        ${'*.json'}         | ${'./project/p1'} | ${'.'}            | ${['project/p1/*.json']}        | ${'./project/p1/src/package.json'}  | ${false}
        ${'*.json'}         | ${'.'}            | ${'./project/p2'} | ${['../../*.json']}             | ${'./package.json'}                 | ${true}
        ${'/**/*.json'}     | ${'.'}            | ${'./project/p2'} | ${['**/*.json']}                | ${'./project/p2/package.json'}      | ${true}
        ${'**/*.json'}      | ${'.'}            | ${'./project/p2'} | ${['**/*.json']}                | ${'./project/p2/package.json'}      | ${true}
        ${'src/*.json'}     | ${'.'}            | ${'./project/p2'} | ${['../../src/*.json']}         | ${'./src/data.json'}                | ${true}
        ${'**/src/*.json'}  | ${'.'}            | ${'./project/p2'} | ${['**/src/*.json']}            | ${'./project/p2/x/src/config.json'} | ${true}
        ${'**/src/*.json'}  | ${'./project/p1'} | ${'.'}            | ${['**/src/*.json']}            | ${'./project/p1/src/config.json'}   | ${true}
        ${'/**/src/*.json'} | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/src/*.json']} | ${'./project/p1/src/config.json'}   | ${true}
    `(
        'mapGlobToRoot include "$glob"@"$globRoot" -> "$root" = "$expectedGlobs"',
        ({ glob, globRoot, root, expectedGlobs, file, expectedToMatch }: TestMapGlobToRoot) => {
            globRoot = path.resolve(globRoot);
            root = path.resolve(root);
            file = path.resolve(file);
            const globMatcher = new GlobMatcher(glob, {
                root: globRoot,
                mode: 'include',
            });
            const patterns = globMatcher.patterns.map((g) => g as Glob);
            const r = normalizeGlobsToRoot(patterns, root, false);
            expect(r).toEqual(expectedGlobs);

            const relToRoot = path.relative(root, file);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
            expect(micromatch.isMatch(relToRoot, expectedGlobs, { windows: path.sep === '\\' })).toBe(expectedToMatch);
        },
    );
});
