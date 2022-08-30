import * as path from 'path';
import { GlobMatcher, GlobMatchOptions, MatcherMode } from './GlobMatcher';
import {
    GlobMatch,
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    PathInterface,
} from './GlobMatcherTypes';

import mm = require('micromatch');

const defaultCwdWin32 = 'C:\\user\\home\\project\\testing';
const defaultCwdPosix = '/user/home/project/testing';

const pathWin32: PathInterface = {
    ...path.win32,
    resolve: (...paths) => path.win32.resolve(defaultCwdWin32, ...paths),
};

const pathPosix: PathInterface = {
    ...path.posix,
    resolve: (...paths) => path.posix.resolve(defaultCwdPosix, ...paths),
};

const pathNames = new Map([
    [pathWin32, 'Win32'],
    [pathPosix, 'Posix'],
]);

describe('Validate assumptions', () => {
    test('path relative', () => {
        const relCrossDevice = path.win32.relative('C:\\user\\home\\project', 'D:\\projects');
        expect(relCrossDevice).toEqual('D:\\projects');
        const relSubDir = path.win32.relative('/User/home/project', '/User/home/project/fun/with/coding');
        expect(relSubDir).toBe(path.win32.normalize('fun/with/coding'));
        const relSubDirPosix = path.posix.relative('/User/home/project', '/User/home/project/fun/with/coding');
        expect(relSubDirPosix).toBe(path.posix.normalize('fun/with/coding'));
    });

    test('path parse', () => {
        const res1 = path.win32.parse('/user/home/project');
        expect(res1.root).toBe('/');
        const res2 = path.win32.parse('user/home/project');
        expect(res2.root).toBe('');
        const res3 = path.win32.parse('C:\\user\\home\\project');
        expect(res3.root).toBe('C:\\');
        const res4 = path.win32.parse('C:user\\home\\project');
        expect(res4.root).toBe('C:');
    });
});

describe('Validate Micromatch assumptions', () => {
    test.each`
        glob                       | filename                      | expectedToMatch
        ${'*.json'}                | ${'settings.json'}            | ${true}
        ${'*.json'}                | ${'/settings.json'}           | ${false}
        ${'*.json'}                | ${'src/settings.json'}        | ${false}
        ${'*.json'}                | ${'/src/settings.json'}       | ${false}
        ${'**/*.json'}             | ${'settings.json'}            | ${true}
        ${'**/*.json'}             | ${'/settings.json'}           | ${true}
        ${'**/*.json'}             | ${'src/settings.json'}        | ${true}
        ${'**/*.json'}             | ${'/src/settings.json'}       | ${true}
        ${'**/temp'}               | ${'/src/temp/data.json'}      | ${false}
        ${'**/temp/'}              | ${'/src/temp/data.json'}      | ${false}
        ${'**/temp/**'}            | ${'/src/temp/data.json'}      | ${true}
        ${'src/*.json'}            | ${'src/settings.json'}        | ${true}
        ${'**/{*.json,*.json/**}'} | ${'settings.json'}            | ${true}
        ${'**/{*.json,*.json/**}'} | ${'/settings.json'}           | ${true}
        ${'**/{*.json,*.json/**}'} | ${'src/settings.json'}        | ${true}
        ${'**/{*.json,*.json/**}'} | ${'src/settings.json/config'} | ${true}
        ${'**/{*.json,*.json/**}'} | ${'settings.json/config'}     | ${true}
        ${'src/*.{test,spec}.ts'}  | ${'src/code.test.ts'}         | ${true}
        ${'src/*.(test|spec).ts'}  | ${'src/code.test.ts'}         | ${true}
        ${'src/*.(test|spec).ts'}  | ${'src/code.spec.ts'}         | ${true}
        ${'src/*.(test|spec).ts'}  | ${'src/deep.code.test.ts'}    | ${true}
        ${'src/*.(test|spec).ts'}  | ${'src/test.ts'}              | ${false}
    `(
        `Micromatch glob: '$glob', filename: '$filename' expected: $expectedToMatch`,
        ({ glob, filename, expectedToMatch }) => {
            const reg1 = mm.makeRe(glob);
            expect(reg1.test(filename)).toEqual(expectedToMatch);
        }
    );
});

function resolveFilename(pathInstance: PathInterface, filename: string): string;
function resolveFilename(pathInstance: PathInterface, filename: string | undefined): string | undefined;
function resolveFilename(pathInstance: PathInterface, filename: string | undefined): string | undefined {
    if (filename === undefined) return filename;
    const usingWin32 = isWin32(pathInstance);
    const rootPrefix = usingWin32 ? 'C:\\' : '';
    const cwd = usingWin32 ? defaultCwdWin32 : defaultCwdPosix;

    filename = filename.replace('${cwd}', cwd);
    filename = filename.startsWith('/') ? pathInstance.join(rootPrefix, filename) : filename;
    filename = pathInstance.resolve(pathInstance.normalize(filename));

    return filename;
}

[pathPosix, pathWin32].forEach((pathInstance) => {
    describe(`Validate GlobMatcher ${pathInstance === pathWin32 ? 'Windows' : 'Posix'}`, () => {
        tests().forEach((curTest, index) => {
            const [patterns, _root, _filename, expected, description] = curTest;
            const root = resolveFilename(pathInstance, _root);
            const filename = resolveFilename(pathInstance, _filename);
            test(`test ${index} ${description}, pattern: [${patterns}] filename: "${filename}", root: "${root}", expected: ${
                expected ? 'T' : 'F'
            }`, () => {
                const matcher = new GlobMatcher(patterns, root, pathInstance);
                try {
                    expect(matcher.match(filename)).toEqual(expected);
                } catch (e) {
                    console.error('Failed on %i %o', index, curTest);
                    throw e;
                }
            });
        });
    });
});

describe('Tests .gitignore file contents', () => {
    const pattern = `
        # This is a comment

        # ignore spec and test files.
        src/*.(test|spec).ts
        node_modules/**
        dist
        *.js
        !**/settings.js
        !!*.txt
        # *.py,cover
        **/temp/**
        /**/temp-local/**
    `;
    const root = '/Users/code/project/cspell/';
    const nonRoot = '/Users/guest/code/';
    // cspell:ignore nobrace
    // const matcher = new GlobMatcher(pattern, root);
    const matcher = new GlobMatcher(pattern, { root, nobrace: false });

    interface TestCase {
        filename: string;
        expected: boolean | Partial<GlobMatch>;
        comment: string;
    }

    test.each`
        filename                                       | expected                                                          | comment
        ${root + 'src/code.py'}                        | ${false}                                                          | ${'Ensure that .py files are allowed'}
        ${root + 'src/code.ts'}                        | ${false}                                                          | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                       | ${true}                                                           | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                        | ${true}                                                           | ${'Ensure that no .js files are allowed'}
        ${root + 'src/code.test.ts'}                   | ${true}                                                           | ${'Ensure that test.ts files are not allowed'}
        ${root + 'src/code.spec.ts'}                   | ${true}                                                           | ${'Ensure that spec.ts files are not allowed'}
        ${nonRoot + 'src/code.test.ts'}                | ${false}                                                          | ${'Ensure that test files in a different root are allowed'}
        ${nonRoot + 'src/code.js'}                     | ${false}                                                          | ${'Ensure *.js files are allowed under a different root.'}
        ${root + 'node_modules/cspell/code.ts'}        | ${true}                                                           | ${'Ensure that node modules are not allowed in the current root.'}
        ${root + 'nested/node_modules/cspell/code.ts'} | ${false}                                                          | ${'Ensure that nested node modules are allowed in the current root.'}
        ${nonRoot + 'node_modules/cspell/code.ts'}     | ${false}                                                          | ${'Ensure that node modules in a different root are allowed'}
        ${root + 'settings.js'}                        | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'dist/settings.js'}                   | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'node_modules/settings.js'}           | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'src/src.cpp'}                        | ${false}                                                          | ${'Ensure code is kept'}
        ${root + 'temp/src/src.cpp'}                   | ${true}                                                           | ${'Ensure temp is rejected'}
        ${root + 'nested/temp/src/src.cpp'}            | ${true}                                                           | ${'Ensure nested temp is rejected'}
        ${root + 'nested/temp-local/src/src.cpp'}      | ${true}                                                           | ${'Ensure nested temp-local is rejected'}
        ${nonRoot + 'nested/temp/src/src.cpp'}         | ${true}                                                           | ${'Ensure non-root nested temp is rejected'}
        ${root + 'src.txt'}                            | ${true}                                                           | ${'Ensure that double negative means block'}
        ${root + 'src.txt'}                            | ${true}                                                           | ${'Ensure that double negative means block'}
        ${root + 'src/code.ts'}                        | ${{ matched: false }}                                             | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                       | ${{ matched: true, pattern: p('**/dist/**'), isNeg: false }}      | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                        | ${{ matched: true, pattern: p('**/*.js'), isNeg: false }}         | ${'Ensure that no .js files are allowed'}
        ${root + 'dist/settings.js'}                   | ${{ matched: false, pattern: p('!**/settings.js'), isNeg: true }} | ${'Ensure that settings.js is kept'}
    `('match && matchEx "$comment" File: "$filename" $expected', ({ filename, expected }: TestCase) => {
        expected = typeof expected === 'boolean' ? { matched: expected } : expected;
        expect(matcher.match(filename)).toBe(expected.matched);
        expect(matcher.matchEx(filename)).toEqual(expect.objectContaining(expected));
    });
});

describe('Tests .gitignore like file contents', () => {
    const pattern = `
        # This is a comment

        # ignore spec and test files.
        src/*.(test|spec).ts
        node_modules/**
        dist
        *.js
        !**/settings.js
        !!*.txt
        *.py,cover
    `;
    const root = '/Users/code/project/cspell/';
    // cspell:ignore nobrace
    const matcher = new GlobMatcher(pattern, { root, nobrace: undefined });

    interface TestCase {
        filename: string;
        expected: boolean | Partial<GlobMatch>;
        comment: string;
    }

    test.each`
        filename                                                | expected                                                          | comment
        ${root + 'src/code.py'}                                 | ${false}                                                          | ${'Broken match - .py files should be allowed'}
        ${root + 'src/code.ts'}                                 | ${false}                                                          | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                                | ${true}                                                           | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                                 | ${true}                                                           | ${'Ensure that no .js files are allowed'}
        ${root + 'src/code.test.ts'}                            | ${true}                                                           | ${'Ensure that test.ts files are not allowed'}
        ${root + 'src/code.spec.ts'}                            | ${true}                                                           | ${'Ensure that spec.ts files are not allowed'}
        ${'/Users/guest/code/' + 'src/code.test.ts'}            | ${false}                                                          | ${'Ensure that test files in a different root are allowed'}
        ${'/Users/guest/code/' + 'src/code.js'}                 | ${false}                                                          | ${'Ensure *.js files are allowed under a different root.'}
        ${root + 'node_modules/cspell/code.ts'}                 | ${true}                                                           | ${'Ensure that node modules are not allowed in the current root.'}
        ${root + 'nested/node_modules/cspell/code.ts'}          | ${false}                                                          | ${'Ensure that nested node modules are allowed in the current root.'}
        ${'/Users/guest/code/' + 'node_modules/cspell/code.ts'} | ${false}                                                          | ${'Ensure that node modules in a different root are allowed'}
        ${root + 'settings.js'}                                 | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'dist/settings.js'}                            | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'node_modules/settings.js'}                    | ${false}                                                          | ${'Ensure that settings.js is kept'}
        ${root + 'src.txt'}                                     | ${true}                                                           | ${'Ensure that double negative means block'}
        ${root + 'src/code.ts'}                                 | ${{ matched: false }}                                             | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                                | ${{ matched: true, pattern: p('**/dist/**'), isNeg: false }}      | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                                 | ${{ matched: true, pattern: p('**/*.js'), isNeg: false }}         | ${'Ensure that no .js files are allowed'}
        ${root + 'dist/settings.js'}                            | ${{ matched: false, pattern: p('!**/settings.js'), isNeg: true }} | ${'Ensure that settings.js is kept'}
    `('match && matchEx "$comment" File: "$filename" $expected', ({ filename, expected }: TestCase) => {
        expected = typeof expected === 'boolean' ? { matched: expected } : expected;
        expect(matcher.match(filename)).toBe(expected.matched);
        expect(matcher.matchEx(filename)).toEqual(expect.objectContaining(expected));
    });
});

describe('Validate Options', () => {
    interface TestCase {
        pattern: string;
        file: string;
        options: string | GlobMatchOptions | undefined;
        root: string | undefined;
        expected: Partial<GlobMatch> | boolean;
    }
    test.each`
        pattern                    | file                                     | root             | options                | expected
        ${'*.yaml'}                | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{}}                  | ${{ matched: true }}
        ${'*.yaml'}                | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ dot: false }}      | ${{ matched: false }}
        ${'*.yaml'}                | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ mode: 'include' }} | ${{ matched: false }}
        ${'*.yaml'}                | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ dot: true }}       | ${{ matched: true, pattern: p('**/*.yaml') }}
        ${'*.yaml'}                | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ dot: true }}       | ${true}
        ${'**/*.yaml'}             | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ mode: 'exclude' }} | ${{ matched: true }}
        ${'**/*.yaml'}             | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ mode: 'include' }} | ${{ matched: false }}
        ${'.github/**/*.yaml'}     | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ dot: true }}       | ${true}
        ${'.github/**/*.yaml'}     | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{ dot: false }}      | ${true}
        ${'.github/**/*.yaml'}     | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{}}                  | ${true}
        ${'.github/**/*.yaml'}     | ${'.github/test.yaml'}                   | ${undefined}     | ${{}}                  | ${true}
        ${'.github/**/*.yaml'}     | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${false}
        ${'**/.github/**/*.yaml'}  | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${true}
        ${'.github'}               | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${true}
        ${'**/.github/**'}         | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${true}
        ${'package/**'}            | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${true}
        ${'package/**'}            | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{ dot: false }}      | ${false}
        ${'package/**'}            | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{ mode: 'include' }} | ${false}
        ${'workflows'}             | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{}}                  | ${true}
        ${'workflows'}             | ${'package/.github/workflows/test.yaml'} | ${undefined}     | ${{ dot: false }}      | ${false}
        ${'package/'}              | ${'package/src/test.yaml'}               | ${undefined}     | ${{}}                  | ${true}
        ${'package/'}              | ${'package/src/test.yaml'}               | ${undefined}     | ${{ dot: false }}      | ${true}
        ${'package/'}              | ${'package/src/test.yaml'}               | ${undefined}     | ${{ mode: 'include' }} | ${true}
        ${'package/'}              | ${'repo/package/src/test.yaml'}          | ${undefined}     | ${{}}                  | ${true}
        ${'package/'}              | ${'repo/package/src/test.yaml'}          | ${undefined}     | ${{ mode: 'include' }} | ${false}
        ${'/package/'}             | ${'package/src/test.yaml'}               | ${undefined}     | ${{}}                  | ${true}
        ${'/package/'}             | ${'package/src/test.yaml'}               | ${undefined}     | ${{ dot: false }}      | ${true}
        ${'/package/'}             | ${'package/src/test.yaml'}               | ${undefined}     | ${{ mode: 'include' }} | ${true}
        ${'/package/'}             | ${'repo/package/src/test.yaml'}          | ${undefined}     | ${{}}                  | ${false}
        ${'/package/'}             | ${'repo/package/src/test.yaml'}          | ${undefined}     | ${{ mode: 'include' }} | ${false}
        ${'src'}                   | ${'package/src/test.yaml'}               | ${undefined}     | ${{ mode: 'include' }} | ${false}
        ${'*.yaml|!test.yaml'}     | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{}}                  | ${{ matched: false, pattern: p('!**/test.yaml'), isNeg: true }}
        ${'*.yaml|!/test.yaml'}    | ${'test.yaml'}                           | ${undefined}     | ${{}}                  | ${{ matched: false, pattern: p('!test.yaml'), isNeg: true }}
        ${'*.yaml|!/node_modules'} | ${'node_modules/test.yaml'}              | ${undefined}     | ${{}}                  | ${{ matched: false, pattern: p('!node_modules/**'), isNeg: true }}
        ${'*.{!yaml}'}             | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{}}                  | ${false}
        ${'test.*|!*.{yaml,yml}'}  | ${'.github/workflows/test.yaml'}         | ${undefined}     | ${{}}                  | ${{ matched: false, isNeg: true }}
        ${'i18/nl_NL'}             | ${'i18/nl_NL/file.txt'}                  | ${undefined}     | ${{ mode: 'exclude' }} | ${{ matched: true }}
        ${'i18/nl_NL'}             | ${'code/i18/nl_NL/file.txt'}             | ${undefined}     | ${{ mode: 'exclude' }} | ${{ matched: false }}
        ${'${cwd}/**/i18/nl_NL'}   | ${'code/i18/nl_NL/file.txt'}             | ${process.cwd()} | ${{ mode: 'exclude' }} | ${{ matched: true }}
    `('options: $pattern, $file, $options, root', ({ pattern, file, options, root, expected }: TestCase) => {
        root = root || '/Users/code/project/cspell/';
        const filename = path.join(root, file);
        const patterns = pattern.split('|');
        options == options ?? root;
        if (typeof options !== 'string' && typeof options !== 'undefined') {
            options.root = options.root ?? root;
        }
        expected = typeof expected === 'boolean' ? { matched: expected } : expected;
        const matcher = new GlobMatcher(patterns, options);
        const r = matcher.matchEx(filename);
        expect(r).toEqual(expect.objectContaining(expected));
    });
});

describe('Validate GlobMatcher', () => {
    function g(glob: string, root?: string): GlobPatternWithOptionalRoot {
        return {
            glob,
            root,
        };
    }
    interface TestCaseMatcher {
        patterns: GlobPattern | GlobPattern[];
        root: string | undefined;
        filename: string;
        mode: MatcherMode;
        expected: boolean;
        description: string;
    }

    function runTestOn(pathInstance: PathInterface) {
        const os = pathNames.get(pathInstance);
        test.each`
            patterns                     | root         | filename                                    | mode         | expected | description
            ${['*.json']}                | ${undefined} | ${'./settings.json'}                        | ${'exclude'} | ${true}  | ${'*.json'}
            ${['*.json']}                | ${undefined} | ${'settings.json'}                          | ${'exclude'} | ${true}  | ${'*.json'}
            ${['*.json']}                | ${undefined} | ${'${cwd}/settings.json'}                   | ${'exclude'} | ${true}  | ${'*.json'}
            ${'*.json'}                  | ${undefined} | ${'${cwd}/settings.json'}                   | ${'exclude'} | ${true}  | ${'*.json'}
            ${'#.gitignore\n *.json'}    | ${undefined} | ${'${cwd}/settings.json'}                   | ${'exclude'} | ${true}  | ${'*.json'}
            ${['middle']}                | ${''}        | ${'${cwd}/packages/middle/settings.json'}   | ${'exclude'} | ${true}  | ${'match middle of path'}
            ${['.vscode']}               | ${undefined} | ${'.vscode/settings.json'}                  | ${'exclude'} | ${true}  | ${'.vscode'}
            ${['/*.json']}               | ${'/'}       | ${'/settings.json'}                         | ${'exclude'} | ${true}  | ${'Matches root level files, /*.json'}
            ${['/*.json']}               | ${undefined} | ${'/src/settings.json'}                     | ${'exclude'} | ${false} | ${'Matches pattern but not cwd /*.json'}
            ${['*.js']}                  | ${undefined} | ${'${cwd}/src/settings.js'}                 | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${'*.js'}                    | ${undefined} | ${'${cwd}/src/settings.js'}                 | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${g('*.js')}                 | ${'.'}       | ${'${cwd}/src/settings.js'}                 | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${g('*.js', 'src')}          | ${'.'}       | ${'${cwd}/src/settings.js'}                 | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/b/src/settings.js'}                    | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/c/src/settings.js'}                    | ${'exclude'} | ${true}  | ${'// Matches even if NOT under root.'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'c/src/settings.js'}                      | ${'exclude'} | ${false} | ${'// Must match glob root'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'exclude'} | ${true}  | ${'.vscode/'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/.vscode'}                         | ${'exclude'} | ${false} | ${'.vscode/'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/.vscode'}                         | ${'exclude'} | ${false} | ${'should not match file'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'exclude'} | ${true}  | ${'should match root'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/package/.vscode'}                 | ${'exclude'} | ${false} | ${'should only match root'}
            ${['.vscode/**']}            | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'exclude'} | ${true}  | ${'should match root .vscode/**'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'exclude'} | ${true}  | ${'should match nested .vscode/'}
            ${['**/.vscode/']}           | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'exclude'} | ${true}  | ${'should match nested .vscode/'}
            ${['**/.vscode/']}           | ${undefined} | ${'${cwd}/src/.vscode'}                     | ${'exclude'} | ${false} | ${'should match nested .vscode'}
            ${['**/.vscode']}            | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'exclude'} | ${true}  | ${'should match nested **/.vscode'}
            ${['**/.vscode/**']}         | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'exclude'} | ${true}  | ${'should match nested **/.vscode'}
            ${['/User/user/Library/**']} | ${undefined} | ${'/src/User/user/Library/settings.json'}   | ${'exclude'} | ${false} | ${'No match'}
            ${['/User/user/Library/**']} | ${undefined} | ${'${cwd}/User/user/Library/settings.json'} | ${'exclude'} | ${true}  | ${'Match cwd root'}
            ${['/User/user/Library/**']} | ${'/'}       | ${'/User/user/Library/settings.json'}       | ${'exclude'} | ${true}  | ${'Match system root'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/b/src/settings.js'}                    | ${'exclude'} | ${true}  | ${'// Matches nested files, *.js'}
            ${['*.json']}                | ${undefined} | ${'./settings.json'}                        | ${'include'} | ${true}  | ${'*.json'}
            ${['*.json']}                | ${undefined} | ${'settings.json'}                          | ${'include'} | ${true}  | ${'*.json'}
            ${['*.json']}                | ${undefined} | ${'${cwd}/settings.json'}                   | ${'include'} | ${true}  | ${'*.json'}
            ${'*.json'}                  | ${undefined} | ${'${cwd}/settings.json'}                   | ${'include'} | ${true}  | ${'*.json'}
            ${'#.gitignore\n *.json'}    | ${undefined} | ${'${cwd}/settings.json'}                   | ${'include'} | ${true}  | ${'*.json'}
            ${['middle']}                | ${''}        | ${'${cwd}/packages/middle/settings.json'}   | ${'include'} | ${false} | ${'match middle of path'}
            ${['.vscode']}               | ${undefined} | ${'.vscode/settings.json'}                  | ${'include'} | ${false} | ${'.vscode'}
            ${['/*.json']}               | ${'/'}       | ${'/settings.json'}                         | ${'include'} | ${true}  | ${'Matches root level files, /*.json'}
            ${['/*.json']}               | ${undefined} | ${'/src/settings.json'}                     | ${'include'} | ${false} | ${'Matches pattern but not cwd /*.json'}
            ${['*.js']}                  | ${undefined} | ${'${cwd}/src/settings.js'}                 | ${'include'} | ${false} | ${'// Does NOT nested files, *.js'}
            ${'*.js'}                    | ${undefined} | ${'${cwd}/src/settings.js'}                 | ${'include'} | ${false} | ${'// Does NOT match nested files, *.js'}
            ${g('*.js')}                 | ${'.'}       | ${'${cwd}/src/settings.js'}                 | ${'include'} | ${false} | ${'// Matches nested files, *.js'}
            ${g('*.js', 'src')}          | ${'.'}       | ${'${cwd}/src/settings.js'}                 | ${'include'} | ${true}  | ${'// Matches nested files, *.js'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/b/src/settings.js'}                    | ${'include'} | ${false} | ${'// Does NOT match nested files, *.js'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/c/src/settings.js'}                    | ${'include'} | ${false} | ${'// Does NOT match if NOT under root.'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'c/src/settings.js'}                      | ${'include'} | ${false} | ${'// Must match glob root'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'include'} | ${true}  | ${'.vscode/'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/.vscode'}                         | ${'include'} | ${false} | ${'.vscode/'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/.vscode'}                         | ${'include'} | ${false} | ${'should not match file'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'include'} | ${true}  | ${'should match root'}
            ${['/.vscode/']}             | ${undefined} | ${'${cwd}/package/.vscode'}                 | ${'include'} | ${false} | ${'should only match root'}
            ${['.vscode/**']}            | ${undefined} | ${'${cwd}/.vscode/settings.json'}           | ${'include'} | ${true}  | ${'should match root .vscode/**'}
            ${['.vscode/']}              | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'include'} | ${false} | ${'should not match nested .vscode/'}
            ${['**/.vscode/']}           | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'include'} | ${true}  | ${'should match nested .vscode/'}
            ${['**/.vscode/']}           | ${undefined} | ${'${cwd}/src/.vscode'}                     | ${'include'} | ${false} | ${'should match nested .vscode'}
            ${['**/.vscode']}            | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'include'} | ${false} | ${'should not match nested **/.vscode'}
            ${['**/.vscode/**']}         | ${undefined} | ${'${cwd}/src/.vscode/settings.json'}       | ${'include'} | ${true}  | ${'should match nested **/.vscode'}
            ${['/User/user/Library/**']} | ${undefined} | ${'/src/User/user/Library/settings.json'}   | ${'include'} | ${false} | ${'No match'}
            ${['/User/user/Library/**']} | ${undefined} | ${'${cwd}/User/user/Library/settings.json'} | ${'include'} | ${true}  | ${'Match cwd root'}
            ${['/User/user/Library/**']} | ${'/'}       | ${'/User/user/Library/settings.json'}       | ${'include'} | ${true}  | ${'Match system root'}
            ${g('*.js', 'a/b')}          | ${'a'}       | ${'a/b/settings.js'}                        | ${'include'} | ${true}  | ${'Matches files, *.js'}
            ${g('*.js', 'a/b')}          | ${'a'}       | ${'a/settings.js'}                          | ${'include'} | ${false} | ${'Does not match parent files, *.js'}
            ${g('*.js', 'a')}            | ${'a/b'}     | ${'a/b/src/settings.js'}                    | ${'include'} | ${false} | ${'Does not match nested files, *.js'}
        `(
            `${os} $mode: $description, patterns: $patterns, filename: $filename, root: $root, $expected`,
            ({ filename, root, patterns, mode, expected }: TestCaseMatcher) => {
                root = resolveFilename(pathInstance, root);
                filename = resolveFilename(pathInstance, filename);
                patterns = resolvePattern(patterns, pathInstance);
                // console.log(`root: ${root}, filename: ${filename}, pattern: ${JSON.stringify(patterns)}`);
                const matcher = new GlobMatcher(patterns, { mode, root, nodePath: pathInstance });

                expect(matcher.match(filename)).toEqual(expected);
            }
        );
    }

    [pathWin32, pathPosix].forEach(runTestOn);
});

describe('Validate GlobMatcher excludeMode patternsNormalizedToRoot', () => {
    function g(glob: string, root?: string): GlobPatternWithOptionalRoot {
        return {
            glob,
            root,
        };
    }

    function ocg(g: Partial<GlobPatternNormalized>, path: PathInterface): GlobPatternNormalized {
        const { root, rawRoot, ...rest } = g;
        const gg: Partial<GlobPatternNormalized> = {};
        if (root !== undefined) {
            gg.root = path.resolve(root);
        }
        if (rawRoot !== undefined) {
            gg.rawRoot = path.resolve(rawRoot);
        }
        return expect.objectContaining({ ...rest, ...gg });
    }

    interface TestCaseNormalizedToRoot {
        patterns: GlobPattern | GlobPattern[];
        root: string | undefined;
        pathInstance: PathInterface;
        mode: GlobMatchOptions['mode'];
        expected: Partial<GlobPatternNormalized>[];
        description: string;
    }

    const expectedGlobs = {
        '*.json': [{ glob: '**/*.json' }, { glob: '**/*.json/**' }],
        '*.js': [{ glob: '**/*.js' }, { glob: '**/*.js/**' }],
        'a/**/*.js': [{ glob: 'a/**/*.js' }, { glob: 'a/**/*.js/**' }],
    };

    function gc(globs: Partial<GlobPatternWithOptionalRoot>[], ...toApply: Partial<GlobPatternWithOptionalRoot>[]) {
        return globs.map((glob) => toApply.reduce((a, b) => ({ ...a, ...b }), glob));
    }

    test.each`
        patterns            | root     | mode         | pathInstance | expected
        ${'*.json'}         | ${''}    | ${'exclude'} | ${pathPosix} | ${expectedGlobs['*.json']}
        ${'*.json'}         | ${''}    | ${'exclude'} | ${pathWin32} | ${expectedGlobs['*.json']}
        ${'*.json\n *.js'}  | ${''}    | ${'exclude'} | ${pathWin32} | ${[...expectedGlobs['*.json'], ...expectedGlobs['*.js']]}
        ${g('*.js', 'a')}   | ${''}    | ${'exclude'} | ${pathWin32} | ${gc(expectedGlobs['a/**/*.js'], { root: '' })}
        ${g('*.js', 'a')}   | ${'a'}   | ${'exclude'} | ${pathWin32} | ${gc(expectedGlobs['*.js'], { root: 'a' })}
        ${g('*.js', 'a')}   | ${'a/b'} | ${'exclude'} | ${pathWin32} | ${gc(expectedGlobs['*.js'], { root: 'a/b' })}
        ${g('*.js', 'a/c')} | ${'a/b'} | ${'exclude'} | ${pathWin32} | ${[]}
        ${g('*.js', 'a/c')} | ${'a/b'} | ${'include'} | ${pathWin32} | ${[]}
    `(
        'excludeMode patternsNormalizedToRoot $patterns $root',
        ({ patterns, root, pathInstance, expected, mode }: TestCaseNormalizedToRoot) => {
            root = resolveFilename(pathInstance, root);
            patterns = resolvePattern(patterns, pathInstance);
            const matcher = new GlobMatcher(patterns, { mode, root, nodePath: pathInstance });
            expected = expected.map((e) => ocg(e, pathInstance));
            expect(matcher.patternsNormalizedToRoot).toEqual(expected);
        }
    );
});

type TestCase = [
    patterns: string[] | string,
    root: string | undefined,
    filename: string,
    expected: boolean,
    description: string
];

function tests(): TestCase[] {
    const from = 0;
    const limit = 0;

    const testCases: TestCase[] = [
        [['*.json'], undefined, './settings.json', true, '*.json'],
        [['*.json'], undefined, 'settings.json', true, '*.json'],
        [['*.json'], undefined, '${cwd}/settings.json', true, '*.json'],
        [['.vscode'], undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'], '/', '/settings.json', true, 'Matches root level files, /*.json'], // .
        [['/*.json'], undefined, '/src/settings.json', false, 'Matches pattern but not cwd /*.json'], // .
        [['*.js'], undefined, '${cwd}/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], undefined, '${cwd}/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], undefined, '${cwd}/.vscode', false, '.vscode/'],
        [['.vscode/'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode/'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested **/.vscode'],
        [['**/.vscode/**'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        [['*.json'], undefined, 'settings.json', true, '*.json'],
        [['.vscode'], undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'], undefined, 'settings.json', true, 'Matches only root level files, /*.json'], // .
        [['/*.json'], undefined, 'src/settings.json', false, 'Matches only root level files, /*.json'], // .
        [['*.js'], undefined, 'src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], undefined, '.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], undefined, '.vscode', false, '.vscode/'],
        [['.vscode/'], undefined, 'src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode/'], undefined, 'src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode'], undefined, 'src/.vscode/settings.json', true, 'should match nested **/.vscode'],
        [['**/.vscode/**'], undefined, 'src/.vscode/settings.json', true, 'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, 'src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], undefined, 'User/user/Library/settings.json', true, 'Match system root'],

        // With Root
        [['*.json'], '/User/code/src', '/User/code/src/settings.json', true, 'With Root *.json'],
        [['.vscode'], '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode'],
        [
            ['/*.json'],
            '/User/code/src',
            '/User/code/src/settings.json',
            true,
            'With Root Matches only root level files, /*.json',
        ], // .
        [['*.js'], '/User/code/src', '/User/code/src/src/settings.js', true, 'With Root Matches nested files, *.js'],
        [['.vscode/'], '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode/'],
        [['.vscode/'], '/User/code/src', '/User/code/src/.vscode', false, 'With Root .vscode/'], // This one shouldn't match, but micromatch says it should. :-(
        [
            ['.vscode/'],
            '/User/code/src',
            '/User/code/src/src/.vscode/settings.json',
            true,
            'With Root should match nested .vscode/',
        ],
        [
            ['**/.vscode/'],
            '/User/code/src',
            '/User/code/src/src/.vscode/settings.json',
            true,
            'With Root should match nested .vscode/',
        ],
        [
            ['/User/user/Library/**'],
            '/User/code/src',
            '/src/User/user/Library/settings.json',
            false,
            'With Root No match',
        ],
        [
            ['/User/user/Library/**'],
            '/User/code/src',
            '/User/user/Library/settings.json',
            false,
            'File has but does not match root',
        ],
        [['tests/*.test.ts'], '/User/code/src', 'tests/code.test.ts', false, 'Relative file with Root'],
        [['tests/**/*.test.ts'], '/User/code/src', 'tests/nested/code.test.ts', false, 'Relative file with Root'],

        [['tests/*.test.ts'], '${cwd}', 'tests/code.test.ts', true, 'Relative file with Root'],
        [['tests/**/*.test.ts'], '${cwd}', 'tests/nested/code.test.ts', true, 'Relative file with Root'],

        // With non matching Root
        [['*.json'], '/User/lib/src', '/User/code/src/settings.json', false, 'With non matching Root *.json'],
        [['.vscode'], '/User/lib/src', '/User/code/src/.vscode/settings.json', false, 'With non matching Root .vscode'],

        // Root with trailing /
        [['*.json'], '/User/code/src/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'], '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode'],
        [
            ['/*.json'],
            '/User/code/src/',
            '/User/code/src/settings.json',
            true,
            'Matches only root level files, /*.json',
        ], // .
        [['*.js'], '/User/code/src/', '/User/code/src/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], '/User/code/src/', '/User/code/src/.vscode', false, '.vscode/'], // This one shouldn't match, but micromatch says it should. :-(
        [
            ['/.vscode/'],
            '/User/code/src/',
            '/User/code/src/src/.vscode/settings.json',
            false,
            "shouldn't match nested .vscode/",
        ],
        [
            ['.vscode/'],
            '/User/code/src/',
            '/User/code/src/src/.vscode/settings.json',
            true,
            'should match nested .vscode/',
        ],
        [['.vscode/'], '/User/code/src/', '/User/code/src/src/.vscode', false, 'should match nested file .vscode'],
        [
            ['**/.vscode/'],
            '/User/code/src/',
            '/User/code/src/src/.vscode/settings.json',
            true,
            'should match nested .vscode/',
        ],
        [['/User/user/Library/**'], '/User/code/src/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/User/code/src/', '/User/user/Library/settings.json', false, 'Match system root'],

        // System Root /
        [['*.json'], '/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'], '/', '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'], '/', '/settings.json', true, 'Matches only root level files, /*.json'], // .
        [['*.js'], '/', '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], '/', '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], '/', '/.vscode', false, '.vscode/'],
        [['.vscode/'], '/', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode/'], '/', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        // Empty Root /
        [['*.json'], '', '${cwd}/User/code/src/settings.json', true, '*.json'],
        [['.vscode'], '', '${cwd}/.vscode/settings.json', true, '.vscode'],
        [['/*.json'], '', '${cwd}/settings.json', true, 'Matches only root level files, /*.json'], // .
        [['/*.json'], '', '${cwd}/src/settings.json', false, 'Matches only root level files, /*.json'], // .
        [['*.js'], '', '${cwd}/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], '', '${cwd}/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], '', '${cwd}/.vscode', false, '.vscode/'],
        [['.vscode/'], '', '${cwd}/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/.vscode/'], '', '${cwd}/src/.vscode/settings.json', false, "shouldn't match nested .vscode/"],
        [['**/.vscode/'], '', '${cwd}/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '', '${cwd}/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '', '${cwd}/User/user/Library/settings.json', true, 'Match system root'],

        // Special characters
        [['#'], '', '/User/code/src/settings.json', false, 'Only comments'],
        [[' #'], '', '/User/code/src/settings.json', false, 'Only comments'],
        [['#', '*.json', '#'], '', '${cwd}/User/code/src/settings.json', true, 'Comments'],
        [['#', '*.json', '*.js'], '', '${cwd}/User/code/src/settings.js', true, 'Multiple patterns'],
        ['#\n*.json\n*.js', '', '${cwd}/User/code/src/settings.js', true, 'Multiple patterns'],
        ['#\n*.json\n*.jsx', '', '${cwd}/User/code/src/settings.js', false, 'Multiple patterns'],
        [['#', '**/src/', '*.js'], '', '${cwd}/User/code/src/settings.js', true, 'Multiple patterns'],
        [['{*.js,*.json}'], '', '${cwd}/User/code/src/settings.js', true, 'Braces'],
        [['{src,dist}'], '', '${cwd}/User/code/src/settings.json', true, 'Braces'],
        [['{src,dist}'], '', '${cwd}/User/code/dist/settings.json', true, 'Braces'],
        [['{src,dist}'], '', '${cwd}/User/code/distribution/settings.json', false, 'Braces'],
        [['**/{src,dist}/**'], '', '${cwd}/User/code/src/settings.json', true, 'Braces'],
        [['**/{src,dist}/**'], '', '${cwd}/User/code/dist/settings.json', true, 'Braces'],
        [['**/{src,dist}/**'], '', '${cwd}/User/code/lib/settings.json', false, 'Braces'],
        [['{*.js,*.json}'], '', '${cwd}/User/code/src/settings.js', true, 'Braces'],
        [['(src|dist)'], '', '${cwd}/User/code/src/settings.json', true, 'Parens'],
        [['(src|dist)'], '', '${cwd}/User/code/dist/settings.json', true, 'Parens'],
        [['(src|dist)'], '', '${cwd}/User/code/distribution/settings.json', false, 'Parens'],
        [['**/(src|dist)/**'], '', '${cwd}/User/code/src/settings.json', true, 'Parens'],
        [['**/(src|dist)/**'], '', '${cwd}/User/code/dist/settings.json', true, 'Parens'],
        [['**/(src|dist)/**'], '', '${cwd}/User/code/lib/settings.json', false, 'Parens'],
        [['#', '**/dist/', '*.js'], '', '${cwd}/User/code/src/settings.js', true, 'Multiple patterns'],
        [['#', '**/dist/', '*.js'], '', '${cwd}/User/code/src/settings.json', false, 'Multiple patterns'],
        [['#', '**/dist/', '*.js*'], '', '${cwd}/User/code/src/settings.json', true, 'Multiple patterns'],
        [['settings.js'], '', '${cwd}/User/code/src/settings.js', true, 'settings.js'],
        [['!settings.js'], '', '${cwd}/User/code/src/settings.js', false, 'Negations'],
        [['!!settings.js'], '', '${cwd}/User/code/src/settings.js', true, 'Negations'],
        [['!!!settings.js'], '', '${cwd}/User/code/src/settings.js', false, 'Negations'],
        [['!/**/settings.js'], '', '${cwd}/User/code/src/settings.js', false, 'Negations'],
        [['!!/**/settings.js'], '', '${cwd}/User/code/src/settings.js', true, 'Negations'],
        [['!**/settings.js'], '', '${cwd}/User/code/src/settings.js', false, 'Negations'],
        [['#', '**/src/', '*.js', '!**/settings.js'], '', '${cwd}/User/code/src/settings.js', false, 'Negations'],
    ];

    return limit ? testCases.slice(from, from + limit) : testCases;
}

function isWin32(pathInstance: PathInterface): boolean {
    if (pathInstance.normalize === path.win32.normalize) {
        return true;
    }
    if (pathInstance.normalize === path.posix.normalize) {
        return false;
    }
    throw new Error('Unknown pathInstance');
}

/** alias for `expected.objectContaining` */
function eo<T>(obj: T): T {
    return expect.objectContaining(obj);
}

/** Helper for function for building expected GlobPatterns */
function p(glob: string, root?: string): GlobPatternWithOptionalRoot {
    return eo(root ? { glob, root } : { glob });
}

function resolvePattern(p: GlobPattern, path: PathInterface): GlobPattern;
function resolvePattern(p: GlobPattern[], path: PathInterface): GlobPattern[];
function resolvePattern(p: GlobPattern | GlobPattern[], path: PathInterface): GlobPattern | GlobPattern[];
function resolvePattern(p: GlobPattern | GlobPattern[], path: PathInterface): GlobPattern | GlobPattern[] {
    if (Array.isArray(p)) {
        return p.map((g) => resolvePattern(g, path));
    }
    if (typeof p === 'string' || p.root === undefined) {
        return p;
    }
    return {
        ...p,
        root: path.resolve(p.root),
    };
}
