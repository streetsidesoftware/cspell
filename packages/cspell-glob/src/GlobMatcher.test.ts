import { GlobMatcher, GlobMatch, PathInterface, GlobMatchOptions } from './GlobMatcher';

import * as path from 'path';
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
    interface MMTest {
        g: string; // glob
        f: string; // filename
        e: boolean; // expected to match
    }
    const testsMicroMatch: MMTest[] = [
        { g: '*.json', f: 'settings.json', e: true },
        { g: '*.json', f: '/settings.json', e: false },
        { g: '*.json', f: 'src/settings.json', e: false },
        { g: '*.json', f: '/src/settings.json', e: false },
        { g: '**/*.json', f: 'settings.json', e: true },
        { g: '**/*.json', f: '/settings.json', e: true },
        { g: '**/*.json', f: 'src/settings.json', e: true },
        { g: '**/*.json', f: '/src/settings.json', e: true },
        { g: 'src/*.json', f: 'src/settings.json', e: true },
        { g: '**/{*.json,*.json/**}', f: 'settings.json', e: true },
        { g: '**/{*.json,*.json/**}', f: '/settings.json', e: true },
        { g: '**/{*.json,*.json/**}', f: 'src/settings.json', e: true },
        { g: '**/{*.json,*.json/**}', f: 'src/settings.json/config', e: true },
        { g: '**/{*.json,*.json/**}', f: 'settings.json/config', e: true },
        { g: 'src/*.{test,spec}.ts', f: 'src/code.test.ts', e: true },
        { g: 'src/*.(test|spec).ts', f: 'src/code.test.ts', e: true },
        { g: 'src/*.(test|spec).ts', f: 'src/code.spec.ts', e: true },
        { g: 'src/*.(test|spec).ts', f: 'src/deep.code.test.ts', e: true },
        { g: 'src/*.(test|spec).ts', f: 'src/test.ts', e: false },
    ];

    testsMicroMatch.forEach(({ g: glob, f: filename, e: expectedToMatch }) => {
        test(`Test Micromatch glob: '${glob}', filename: '${filename}' expected: ${
            expectedToMatch ? 'true' : 'false'
        }`, () => {
            const reg1 = mm.makeRe(glob);
            expect(reg1.test(filename)).toEqual(expectedToMatch);
        });
    });
});

[pathPosix, pathWin32].forEach((pathInstance) => {
    describe(`Validate GlobMatcher ${pathInstance === pathWin32 ? 'Windows' : 'Posix'}`, () => {
        tests().forEach(([patterns, root, filename, expected, description], index) => {
            const rootPrefix = pathInstance === pathWin32 ? 'C:\\' : '';
            const cwd = pathInstance === pathWin32 ? defaultCwdWin32 : defaultCwdPosix;
            root = root?.replace('${cwd}', cwd);
            root = root ? pathInstance.normalize(pathInstance.join(rootPrefix, root)) : root;
            filename = filename.replace('${cwd}', cwd);
            const fileIsAbsolute = filename.startsWith('/');
            filename = pathInstance.normalize(fileIsAbsolute ? pathInstance.join(rootPrefix, filename) : filename);
            test(`test ${index} ${description}, pattern: [${patterns}] filename: "${filename}", root: "${root}", expected: ${
                expected ? 'T' : 'F'
            }`, () => {
                const matcher = new GlobMatcher(patterns, root, pathInstance);
                expect(matcher.match(filename)).toEqual(expected);
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
    `;
    const root = '/Users/code/project/cspell/';
    const matcher = new GlobMatcher(pattern, root);

    interface TestCase {
        filename: string;
        expected: boolean | Partial<GlobMatch>;
        comment: string;
    }

    test.each`
        filename                                                | expected                                                              | comment
        ${root + 'src/code.ts'}                                 | ${false}                                                              | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                                | ${true}                                                               | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                                 | ${true}                                                               | ${'Ensure that no .js files are allowed'}
        ${root + 'src/code.test.ts'}                            | ${true}                                                               | ${'Ensure that test.ts files are not allowed'}
        ${root + 'src/code.spec.ts'}                            | ${true}                                                               | ${'Ensure that spec.ts files are not allowed'}
        ${'/Users/guest/code/' + 'src/code.test.ts'}            | ${false}                                                              | ${'Ensure that test files in a different root are allowed'}
        ${'/Users/guest/code/' + 'src/code.js'}                 | ${false}                                                              | ${'Ensure *.js files are allowed under a different root.'}
        ${root + 'node_modules/cspell/code.ts'}                 | ${true}                                                               | ${'Ensure that node modules are not allowed in the current root.'}
        ${root + 'nested/node_modules/cspell/code.ts'}          | ${false}                                                              | ${'Ensure that nested node modules are allowed in the current root.'}
        ${'/Users/guest/code/' + 'node_modules/cspell/code.ts'} | ${false}                                                              | ${'Ensure that node modules in a different root are allowed'}
        ${root + 'settings.js'}                                 | ${false}                                                              | ${'Ensure that settings.js is kept'}
        ${root + 'dist/settings.js'}                            | ${false}                                                              | ${'Ensure that settings.js is kept'}
        ${root + 'node_modules/settings.js'}                    | ${false}                                                              | ${'Ensure that settings.js is kept'}
        ${root + 'src.txt'}                                     | ${true}                                                               | ${'Ensure that double negative means block'}
        ${root + 'src/code.ts'}                                 | ${{ matched: false }}                                                 | ${'Ensure that .ts files are allowed'}
        ${root + 'dist/code.ts'}                                | ${{ matched: true, glob: 'dist', index: 6, isNeg: false }}            | ${'Ensure that `dest` .ts files are not allowed'}
        ${root + 'src/code.js'}                                 | ${{ matched: true, glob: '*.js', index: 7, isNeg: false }}            | ${'Ensure that no .js files are allowed'}
        ${root + 'dist/settings.js'}                            | ${{ matched: false, glob: '!**/settings.js', index: 8, isNeg: true }} | ${'Ensure that settings.js is kept'}
    `('match && matchEx "$comment" File: "$filename" $expected', ({ filename, expected }: TestCase) => {
        expected = typeof expected === 'boolean' ? { matched: expected } : expected;
        expect(matcher.match(filename)).toBe(expected.matched);
        expect(matcher.matchEx(filename)).toEqual(expect.objectContaining(expected));
    });
});

describe('Validate Options', () => {
    interface TestCase {
        pattern: string;
        text: string;
        options: string | GlobMatchOptions | undefined;
        expected: Partial<GlobMatch> | boolean;
    }
    test.each`
        pattern                   | text                                     | options           | expected
        ${'*.yaml'}               | ${'.github/workflows/test.yaml'}         | ${{}}             | ${{ matched: false }}
        ${'*.yaml'}               | ${'.github/workflows/test.yaml'}         | ${{ dot: true }}  | ${{ matched: true, glob: '*.yaml' }}
        ${'*.yaml'}               | ${'.github/workflows/test.yaml'}         | ${{ dot: true }}  | ${true}
        ${'.github/**/*.yaml'}    | ${'.github/workflows/test.yaml'}         | ${{ dot: true }}  | ${true}
        ${'.github/**/*.yaml'}    | ${'.github/workflows/test.yaml'}         | ${{ dot: false }} | ${true}
        ${'.github/**/*.yaml'}    | ${'.github/workflows/test.yaml'}         | ${{}}             | ${true}
        ${'.github/**/*.yaml'}    | ${'.github/test.yaml'}                   | ${{}}             | ${true}
        ${'.github/**/*.yaml'}    | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${false}
        ${'**/.github/**/*.yaml'} | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${true}
        ${'.github'}              | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${true}
        ${'**/.github/**'}        | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${true}
        ${'package/**'}           | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${false}
        ${'package/**'}           | ${'package/.github/workflows/test.yaml'} | ${{ dot: true }}  | ${true}
        ${'workflows'}            | ${'package/.github/workflows/test.yaml'} | ${{}}             | ${false}
        ${'workflows'}            | ${'package/.github/workflows/test.yaml'} | ${{ dot: true }}  | ${true}
        ${'*.yaml|!test.yaml'}    | ${'.github/workflows/test.yaml'}         | ${{ dot: true }}  | ${{ matched: false, glob: '!test.yaml', isNeg: true }}
        ${'*.{!yml}'}             | ${'.github/workflows/test.yaml'}         | ${{ dot: true }}  | ${false}
    `('Test options: $pattern, $text, $options', ({ pattern, text, options, expected }: TestCase) => {
        const root = '/Users/code/project/cspell/';
        const patterns = pattern.split('|');
        options == options ?? root;
        if (typeof options !== 'string' && typeof options !== 'undefined') {
            options.root = options.root ?? root;
        }
        expected = typeof expected === 'boolean' ? { matched: expected } : expected;
        const matcher = new GlobMatcher(patterns, options);
        const r = matcher.matchEx(text);
        expect(r).toEqual(expect.objectContaining(expected));
    });
});

type TestCase = [string[] | string, string | undefined, string, boolean, string];

function tests(): TestCase[] {
    const from = 0;
    const limit = 0;

    const testCases: TestCase[] = [
        [['*.json'], undefined, './settings.json', true, '*.json'],
        [['*.json'], undefined, 'settings.json', true, '*.json'],
        [['*.json'], undefined, '${cwd}/settings.json', true, '*.json'],
        [['.vscode'], undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'], '/', '/settings.json', true, 'Matches only root level files, /*.json'], // .
        [['/*.json'], undefined, '/src/settings.json', false, 'Matches pattern but not cwd /*.json'], // .
        [['*.js'], undefined, '${cwd}/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], undefined, '${cwd}/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], undefined, '${cwd}/.vscode', true, '.vscode/'],
        [['.vscode/'], undefined, '${cwd}/src/.vscode/settings.json', false, "shouldn't match nested .vscode/"],
        [['**/.vscode/'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode'], undefined, '${cwd}/src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
        [['**/.vscode/**'], undefined, '${cwd}/src/.vscode/settings.json', true, 'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        [['*.json'], undefined, 'settings.json', true, '*.json'],
        [['.vscode'], undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'], undefined, 'settings.json', true, 'Matches only root level files, /*.json'], // .
        [['/*.json'], undefined, 'src/settings.json', false, 'Matches only root level files, /*.json'], // .
        [['*.js'], undefined, 'src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], undefined, '.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], undefined, '.vscode', true, '.vscode/'],
        [['.vscode/'], undefined, 'src/.vscode/settings.json', false, "shouldn't match nested .vscode/"],
        [['**/.vscode/'], undefined, 'src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['**/.vscode'], undefined, 'src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
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
        [['.vscode/'], '/User/code/src', '/User/code/src/.vscode', true, 'With Root .vscode/'], // This one shouldn't match, but micromatch says it should. :-(
        [
            ['.vscode/'],
            '/User/code/src',
            '/User/code/src/src/.vscode/settings.json',
            false,
            "With Root shouldn't match nested .vscode/",
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
        [['tests/*.test.ts'], '/User/code/src', 'tests/code.test.ts', true, 'Relative file with Root'],
        [['tests/**/*.test.ts'], '/User/code/src', 'tests/nested/code.test.ts', true, 'Relative file with Root'],

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
        [['.vscode/'], '/User/code/src/', '/User/code/src/.vscode', true, '.vscode/'], // This one shouldn't match, but micromatch says it should. :-(
        [
            ['.vscode/'],
            '/User/code/src/',
            '/User/code/src/src/.vscode/settings.json',
            false,
            "shouldn't match nested .vscode/",
        ],
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
        [['.vscode/'], '/', '/.vscode', true, '.vscode/'],
        [['.vscode/'], '/', '/src/.vscode/settings.json', false, "shouldn't match nested .vscode/"],
        [['**/.vscode/'], '/', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        // Empty Root /
        [['*.json'], '', '${cwd}/User/code/src/settings.json', true, '*.json'],
        [['.vscode'], '', '${cwd}/.vscode/settings.json', true, '.vscode'],
        [['/*.json'], '', '${cwd}/settings.json', true, 'Matches only root level files, /*.json'], // .
        [['*.js'], '', '${cwd}/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'], '', '${cwd}/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'], '', '${cwd}/.vscode', true, '.vscode/'],
        [['.vscode/'], '', '${cwd}/src/.vscode/settings.json', false, "shouldn't match nested .vscode/"],
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
