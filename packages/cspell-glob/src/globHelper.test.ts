import { fileOrGlobToGlob, normalizeGlobPatterns } from './globHelper';
import { win32, posix } from 'path';
import * as path from 'path';
import { GlobPattern, GlobPatternNormalized, GlobPatternWithOptionalRoot, PathInterface } from './GlobMatcherTypes';
import mm = require('micromatch');

describe('Validate fileOrGlobToGlob', () => {
    function g(glob: string, root: string) {
        return { glob, root };
    }

    function p(root: string, path: PathInterface): string {
        const cwd = path === win32 ? 'E:\\user\\projects' : '/User/projects';
        return path.resolve(cwd, root);
    }

    function pp(root: string): string {
        return p(root, posix);
    }

    function pw(root: string): string {
        return p(root, win32);
    }

    test.each`
        file                                        | root   | path     | expected                                           | comment
        ${'*.json'}                                 | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${'posix'}
        ${'*.json'}                                 | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${'win32'}
        ${pp('./*.json')}                           | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${''}
        ${pw('./*.json')}                           | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${''}
        ${pp('./package.json')}                     | ${'.'} | ${posix} | ${g('package.json', pp('.'))}                      | ${''}
        ${pw('.\\package.json')}                    | ${'.'} | ${win32} | ${g('package.json', pw('.'))}                      | ${''}
        ${pp('./a/package.json')}                   | ${'.'} | ${posix} | ${g('a/package.json', pp('.'))}                    | ${''}
        ${pw('.\\a\\package.json')}                 | ${'.'} | ${win32} | ${g('a/package.json', pw('.'))}                    | ${''}
        ${'/user/tester/projects'}                  | ${'.'} | ${posix} | ${g('/user/tester/projects', pp('.'))}             | ${'Directory not matching root.'}
        ${'C:\\user\\tester\\projects'}             | ${'.'} | ${win32} | ${g('C:/user/tester/projects', pw('.'))}           | ${'Directory not matching root.'}
        ${'/user/tester/projects/**/*.json'}        | ${'.'} | ${posix} | ${g('/user/tester/projects/**/*.json', pp('.'))}   | ${'A glob like path not matching the root.'}
        ${'C:\\user\\tester\\projects\\**\\*.json'} | ${'.'} | ${win32} | ${g('C:/user/tester/projects/**/*.json', pw('.'))} | ${'A glob like path not matching the root.'}
    `('fileOrGlobToGlob file: "$file" root: "$root" $comment', ({ file, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(file, root, path);
        expect(r).toEqual(expected);
    });
});

describe('Validate Glob Normalization to root', () => {
    function mg(
        patterns: GlobPattern | GlobPattern[],
        root?: string,
        source = 'cspell.json'
    ): GlobPatternWithOptionalRoot[] {
        root = path.resolve(root || '.');
        patterns = Array.isArray(patterns) ? patterns : typeof patterns === 'string' ? patterns.split('|') : [patterns];
        source = path.join(root, source);

        return patterns.map((p) => (typeof p === 'string' ? { glob: p } : p)).map((g) => ({ root, source, ...g }));
    }

    function j(
        patterns: GlobPatternWithOptionalRoot[],
        ...additional: (GlobPatternWithOptionalRoot[] | GlobPatternWithOptionalRoot)[]
    ): GlobPatternWithOptionalRoot[] {
        function* flatten() {
            for (const a of additional) {
                if (Array.isArray(a)) {
                    yield* a;
                } else {
                    yield a;
                }
            }
        }

        return patterns.concat([...flatten()]);
    }

    function e(...expected: Partial<GlobPatternNormalized>[]) {
        return expected
            .map((e) => {
                const p: Partial<GlobPatternNormalized> = {};
                if (e.root) {
                    p.root = path.resolve(e.root);
                }
                if (e.rawRoot) {
                    p.rawRoot = path.resolve(e.rawRoot);
                }
                return { ...e, ...p };
            })
            .map((e) => expect.objectContaining(e));
    }

    interface TestCase {
        globs: GlobPatternWithOptionalRoot[];
        root: string;
        expectedGlobs: GlobPatternNormalized[];
        comment: string;
    }

    test.each`
        globs                                                   | root         | expectedGlobs                                                                                               | comment
        ${mg('*.json')}                                         | ${'.'}       | ${e({ rawGlob: '*.json', glob: '**/{*.json,*.json/**}' })}                                                  | ${'Glob with same root'}
        ${mg('!*.json')}                                        | ${'.'}       | ${e({ rawGlob: '!*.json', glob: '!**/{*.json,*.json/**}' })}                                                | ${'Negative glob'}
        ${mg('!*.json', 'project/a')}                           | ${'.'}       | ${e({ rawGlob: '!*.json', glob: '!project/a/**/{*.json,*.json/**}' })}                                      | ${'Negative in Sub dir glob.'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'.'}       | ${e({ rawGlob: '*.json', glob: 'project/a/**/{*.json,*.json/**}' }, { glob: '**/{*.ts,*.ts/**}' })}         | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'.'}       | ${e({ glob: '**/{*.ts,*.ts/**}' })}                                                                         | ${'Glob not in root is removed.'}
        ${mg('*.json')}                                         | ${'project'} | ${e({ rawGlob: '*.json', glob: '**/{*.json,*.json/**}' })}                                                  | ${'Root deeper than glob'}
        ${mg('!*.json')}                                        | ${'project'} | ${e({ rawGlob: '!*.json', glob: '!**/{*.json,*.json/**}' })}                                                | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'project'} | ${e({ rawGlob: '*.json', glob: 'a/**/{*.json,*.json/**}' }, { glob: '**/{*.ts,*.ts/**}' })}                 | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'), mg('*.ts', '.'))} | ${'project'} | ${e({ rawGlob: '/node_modules', glob: 'a/{node_modules,node_modules/**}' }, { glob: '**/{*.ts,*.ts/**}' })} | ${'Root in the middle. /node_modules'}
        ${j(mg('!/node_modules', 'project/a'))}                 | ${'project'} | ${e({ rawGlob: '!/node_modules', glob: '!a/{node_modules,node_modules/**}' })}                              | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'project'} | ${e({ glob: '**/{*.ts,*.ts/**}' })}                                                                         | ${'Glob not in root is removed.'}
        ${j(mg('*.json', '../tests/a'))}                        | ${'project'} | ${e()}                                                                                                      | ${'Glob not in root is removed.'}
        ${j(mg('*/*.json', 'project/a'))}                       | ${'project'} | ${e({ glob: 'a/*/*.json' })}                                                                                | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                               | ${'project'} | ${e({ glob: '*.json' })}                                                                                    | ${'nested */*.json'}
    `('tests normalization nested "$comment" root: "$root"', ({ globs, root, expectedGlobs }: TestCase) => {
        root = path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: true, nodePath: path });
        expect(r).toEqual(expectedGlobs);
    });

    test.each`
        globs                                                         | root             | expectedGlobs                                                                | comment
        ${mg('*.json')}                                               | ${'.'}           | ${e({ rawGlob: '*.json', glob: '*.json' })}                                  | ${'Glob with same root'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}              | ${'.'}           | ${e({ rawGlob: '*.json', glob: 'project/a/*.json' }, { glob: '*.ts' })}      | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}             | ${'.'}           | ${e({ glob: '*.ts' })}                                                       | ${'Glob not in root is removed.'}
        ${mg('*.json')}                                               | ${'project'}     | ${e({ glob: '*.json', root: '.' })}                                          | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}              | ${'project'}     | ${e({ rawGlob: '*.json', glob: 'a/*.json' }, { glob: '*.ts', root: '.' })}   | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'), mg('*.ts', 'project'))} | ${'project'}     | ${e({ rawGlob: '/node_modules', glob: 'a/node_modules' }, { glob: '*.ts' })} | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'), mg('**/*.ts', '.'))}          | ${'project'}     | ${e({ glob: '**/*.ts' })}                                                    | ${'Glob not in root is removed.'}
        ${j(mg('*.json', '../tests/a'))}                              | ${'project'}     | ${e()}                                                                       | ${'Glob not in root is removed.'}
        ${j(mg('*/*.json', 'project/a'))}                             | ${'project'}     | ${e({ glob: 'a/*/*.json' })}                                                 | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                                     | ${'project'}     | ${e({ glob: '*.json' })}                                                     | ${'nested */*.json'}
        ${j(mg('project/*/*.json', '.'))}                             | ${'project/sub'} | ${e({ glob: '*.json' })}                                                     | ${'nested project/*/*.json'}
    `('tests normalization not nested "$comment" root: "$root"', ({ globs, root, expectedGlobs }: TestCase) => {
        root = path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: false, nodePath: path });
        expect(r).toEqual(expectedGlobs);
    });
});

describe('Validate minimatch assumptions', () => {
    interface TestCase {
        pattern: string;
        file: string;
        options: mm.Options;
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
        ${'node_modules/'}     | ${'node_modules/cspell/package.json'} | ${{}}                  | ${false} | ${''}
        ${'node_modules/'}     | ${'node_modules'}                     | ${{}}                  | ${false} | ${''}
        ${'node_modules/**'}   | ${'node_modules/cspell/package.json'} | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**/*'} | ${'node_modules/package.json'}        | ${{}}                  | ${true}  | ${''}
        ${'node_modules/**'}   | ${'node_modules'}                     | ${{}}                  | ${true}  | ${'Note: this seems to be a bug with micromatch (minimatch return false)'}
        ${'node_modules/**/*'} | ${'node_modules'}                     | ${{}}                  | ${false} | ${'Note: this is a work around for `/**` not working.'}
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
        ${'{!*.js,*.ts}'}      | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative'}
        ${'{!*.js,*.ts}'}      | ${'index.ts'}                         | ${{}}                  | ${true}  | ${'nested negative'}
        ${'{*.js,!index.js}'}  | ${'index.js'}                         | ${{}}                  | ${true}  | ${'nested negative does not work as expected'}
        ${'{!!index.js,*.ts}'} | ${'index.js'}                         | ${{}}                  | ${false} | ${'nested negative does not work as expected'}
    `(
        'assume glob "$pattern" matches "$file" is $expected - $comment',
        ({ pattern, file, options, expected }: TestCase) => {
            const r = mm.isMatch(file, pattern, options);
            expect(r).toBe(expected);
        }
    );
});
