import * as path from 'path';
import { calcGlobs, normalizeGlobsToRoot } from './glob';
import { GlobMatcher } from 'cspell-glob';
import mm = require('micromatch');
import minimatch = require('minimatch');

const getStdinResult = {
    value: '',
};

jest.mock('get-stdin', () => {
    return jest.fn(() => Promise.resolve(getStdinResult.value));
});

describe('Validate minimatch assumptions', () => {
    interface TestCase {
        pattern: string;
        file: string;
        options: minimatch.IOptions;
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
        ${'{!!index.js,*.ts}'} | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative does not work as expected'}
    `('assume glob "$pattern" matches "$file" is $expected', ({ pattern, file, options, expected }: TestCase) => {
        const r = minimatch(file, pattern, options);
        expect(r).toBe(expected);
    });
});

describe('Validate internal functions', () => {
    test('exclude globs default', () => {
        const ex: string[] = [];
        const r = calcGlobs(ex);
        expect(r).toEqual(
            expect.objectContaining({
                source: 'default',
            })
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

    interface TestMapGlobToRoot {
        glob: string;
        globRoot: string;
        root: string;
        expectedGlobs: string[];
        file: string;
        expectedToMatch: boolean;
    }

    test.each`
        glob               | globRoot          | root              | expectedGlobs                                                  | file                                | expectedToMatch
        ${'src/*.json'}    | ${'.'}            | ${'./project/p2'} | ${[]}                                                          | ${''}                               | ${false}
        ${'**'}            | ${'.'}            | ${'.'}            | ${['**']}                                                      | ${'./package.json'}                 | ${true}
        ${'*.json'}        | ${'.'}            | ${'.'}            | ${['**/*.json', '**/*.json/**']}                               | ${'./package.json'}                 | ${true}
        ${'*.json'}        | ${'.'}            | ${'.'}            | ${['**/*.json', '**/*.json/**']}                               | ${'./.git/package.json'}            | ${true}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/*.json', 'project/p1/**/*.json/**']}         | ${'./project/p1/package.json'}      | ${true}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/*.json', 'project/p1/**/*.json/**']}         | ${'./project/p1/src/package.json'}  | ${true}
        ${'*.json'}        | ${'.'}            | ${'./project/p2'} | ${['**/*.json', '**/*.json/**']}                               | ${'./project/p2/package.json'}      | ${true}
        ${'src/*.json'}    | ${'.'}            | ${'./project/p2'} | ${[]}                                                          | ${''}                               | ${false}
        ${'**/src/*.json'} | ${'.'}            | ${'./project/p2'} | ${['**/src/*.json', '**/src/*.json/**']}                       | ${'./project/p2/x/src/config.json'} | ${true}
        ${'**/src/*.json'} | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/src/*.json', 'project/p1/**/src/*.json/**']} | ${'./project/p1/src/config.json'}   | ${true}
    `(
        'mapGlobToRoot exclude "$glob"@"$globRoot" -> "$root" = "$expectedGlobs"',
        ({ glob, globRoot, root, expectedGlobs, file, expectedToMatch }: TestMapGlobToRoot) => {
            globRoot = path.resolve(globRoot);
            root = path.resolve(root);
            file = path.resolve(file);
            const globMatcher = new GlobMatcher(glob, {
                root: globRoot,
                mode: 'exclude',
            });
            const patterns = globMatcher.patterns;
            const r = normalizeGlobsToRoot(patterns, root, true);
            expect(r).toEqual(expectedGlobs);

            const relToRoot = path.relative(root, file);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
            expect(mm.isMatch(relToRoot, expectedGlobs, { dot: true })).toBe(expectedToMatch);
        }
    );

    test.each`
        glob               | globRoot          | root              | expectedGlobs                   | file                                | expectedToMatch
        ${'*.json'}        | ${'.'}            | ${'.'}            | ${['*.json']}                   | ${'./package.json'}                 | ${true}
        ${'*.json'}        | ${'.'}            | ${'.'}            | ${['*.json']}                   | ${'./.git/package.json'}            | ${false}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/*.json']}        | ${'./project/p1/package.json'}      | ${true}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/*.json']}        | ${'./project/p1/src/package.json'}  | ${false}
        ${'*.json'}        | ${'.'}            | ${'./project/p2'} | ${[]}                           | ${'./project/p2/package.json'}      | ${false}
        ${'**/*.json'}     | ${'.'}            | ${'./project/p2'} | ${['**/*.json']}                | ${'./project/p2/package.json'}      | ${true}
        ${'src/*.json'}    | ${'.'}            | ${'./project/p2'} | ${[]}                           | ${''}                               | ${false}
        ${'**/src/*.json'} | ${'.'}            | ${'./project/p2'} | ${['**/src/*.json']}            | ${'./project/p2/x/src/config.json'} | ${true}
        ${'**/src/*.json'} | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/src/*.json']} | ${'./project/p1/src/config.json'}   | ${true}
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
            const patterns = globMatcher.patterns;
            const r = normalizeGlobsToRoot(patterns, root, false);
            expect(r).toEqual(expectedGlobs);

            const relToRoot = path.relative(root, file);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
            expect(mm.isMatch(relToRoot, expectedGlobs)).toBe(expectedToMatch);
        }
    );
});
