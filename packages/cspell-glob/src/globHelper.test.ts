import mm from 'micromatch';
import * as path from 'path';
import { posix, win32 } from 'path';

import type { NormalizeOptions } from './globHelper';
import {
    __testing__,
    fileOrGlobToGlob,
    normalizeGlobPattern,
    normalizeGlobPatterns,
    normalizeGlobToRoot,
} from './globHelper';
import type {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes';

const { rebaseGlob, trimGlob, isGlobalGlob } = __testing__;

const pathWin32 = makePathInterface(win32, '.');
const pathPosix = makePathInterface(posix, '.');

const knownGlobs = {
    node_modules: gg('**/node_modules', '**/node_modules/**'),
    '*.json': gg('**/*.json', '**/*.json/**'),
    '!*.json': gg('!**/*.json', '!**/*.json/**'),
    '*.js': gg('**/*.js', '**/*.js/**'),
    '*.ts': gg('**/*.ts', '**/*.ts/**'),
    'project/a/***.json': gg('project/a/**/*.json', 'project/a/**/*.json/**'),
} as const;

type KnownGlob = keyof typeof knownGlobs;

describe('Validate fileOrGlobToGlob', () => {
    function g(glob: string, root: string, isGlobalPattern = false) {
        return { glob, root, isGlobalPattern };
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
        file                                         | root   | path     | expected                                           | comment
        ${'*.json'}                                  | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${'posix'}
        ${'*.json'}                                  | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${'win32'}
        ${{ glob: '*.json' }}                        | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${'posix'}
        ${{ glob: '*.json', root: pp('./data') }}    | ${'.'} | ${posix} | ${g('*.json', pp('./data'))}                       | ${'posix'}
        ${pp('./*.json')}                            | ${'.'} | ${posix} | ${g('*.json', pp('.'))}                            | ${''}
        ${pw('./*.json')}                            | ${'.'} | ${win32} | ${g('*.json', pw('.'))}                            | ${''}
        ${pp('./package.json')}                      | ${'.'} | ${posix} | ${g('package.json', pp('.'))}                      | ${''}
        ${pw('.\\package.json')}                     | ${'.'} | ${win32} | ${g('package.json', pw('.'))}                      | ${''}
        ${pp('./package.json')}                      | ${'.'} | ${posix} | ${g('package.json', pp('.'))}                      | ${''}
        ${'.\\package.json'}                         | ${'.'} | ${win32} | ${g('package.json', pw('.'))}                      | ${''}
        ${'./a/package.json'}                        | ${'.'} | ${posix} | ${g('a/package.json', pp('.'))}                    | ${''}
        ${pw('.\\a\\package.json')}                  | ${'.'} | ${win32} | ${g('a/package.json', pw('.'))}                    | ${''}
        ${'/user/tester/projects'}                   | ${'.'} | ${posix} | ${g('/user/tester/projects', pp('.'))}             | ${'Directory not matching root.'}
        ${'C:\\user\\tester\\projects'}              | ${'.'} | ${win32} | ${g('C:/user/tester/projects', pw('.'))}           | ${'Directory not matching root.'}
        ${'E:\\user\\projects\\spell\\package.json'} | ${'.'} | ${win32} | ${g('spell/package.json', pw('.'))}                | ${'Directory matching root.'}
        ${'e:\\user\\projects\\spell\\package.json'} | ${'.'} | ${win32} | ${g('spell/package.json', pw('.'))}                | ${'Directory matching root.'}
        ${'/user/tester/projects/**/*.json'}         | ${'.'} | ${posix} | ${g('/user/tester/projects/**/*.json', pp('.'))}   | ${'A glob like path not matching the root.'}
        ${'C:\\user\\tester\\projects\\**\\*.json'}  | ${'.'} | ${win32} | ${g('C:/user/tester/projects/**/*.json', pw('.'))} | ${'A glob like path not matching the root.'}
    `('fileOrGlobToGlob file: "$file" root: "$root" $comment', ({ file, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(file, root, path);
        expect(r).toEqual(expected);
    });
});

describe('Validate Glob Normalization to root', () => {
    const globalGlob: Partial<GlobPatternNormalized> = { isGlobalPattern: true };
    const relGlob: Partial<GlobPatternNormalized> = { isGlobalPattern: false };

    function g(
        pattern: GlobPattern,
        root = '.',
        source = 'cspell.json',
        nodePath: PathInterface = path
    ): GlobPatternWithRoot {
        root = nodePath.resolve(root || '.');
        source = nodePath.join(root, source);
        pattern = typeof pattern === 'string' ? { glob: pattern } : pattern;
        const isGlobalPattern = isGlobalGlob(pattern.glob);
        root = pattern.root ?? root;
        return { source, ...pattern, root, isGlobalPattern };
    }

    interface GlobNPath {
        glob: GlobPatternWithRoot;
        path: PathInterface;
    }
    function gp(pattern: GlobPattern, root?: string, nodePath: PathInterface = path): GlobNPath {
        return {
            glob: g(pattern, root, undefined, nodePath),
            path: nodePath,
        };
    }

    function mg(
        patterns: GlobPattern | GlobPattern[],
        root?: string,
        source = 'cspell.json',
        nodePath = path
    ): GlobPatternWithOptionalRoot[] {
        patterns = Array.isArray(patterns) ? patterns : typeof patterns === 'string' ? patterns.split('|') : [patterns];

        return patterns.map((p) => g(p, root, source, nodePath));
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

    function eg(e: Partial<GlobPatternNormalized>, path: PathInterface) {
        const p: Partial<GlobPatternNormalized> = {};
        if (e.root) {
            p.root = path.resolve(e.root);
        }
        if (e.rawRoot) {
            p.rawRoot = path.resolve(e.rawRoot);
        }
        return expect.objectContaining({ ...e, ...p });
    }

    function e(
        ...expected: (Partial<GlobPatternNormalized> | Partial<GlobPatternNormalized>[])[]
    ): Partial<GlobPatternNormalized>[] {
        function* flatten() {
            for (const e of expected) {
                if (Array.isArray(e)) {
                    yield* e;
                } else {
                    yield e;
                }
            }
        }

        return [...flatten()].map((e) => eg(e, path));
    }

    test.each`
        glob                                   | base         | file                            | expected
        ${'**/*.json'}                         | ${''}        | ${'cfg.json'}                   | ${'**/*.json'}
        ${'**/*.json'}                         | ${''}        | ${'project/cfg.json'}           | ${'**/*.json'}
        ${'*.json'}                            | ${''}        | ${'cfg.json'}                   | ${'*.json'}
        ${'*.json'}                            | ${''}        | ${'!cfg.js'}                    | ${'*.json'}
        ${'package.json'}                      | ${'/'}       | ${'package.json'}               | ${'package.json'}
        ${'*/package.json'}                    | ${'/'}       | ${'config/package.json'}        | ${'*/package.json'}
        ${'**/*.json'}                         | ${'project'} | ${'cfg.json'}                   | ${'**/*.json'}
        ${'*.json'}                            | ${'project'} | ${'cfg.json'}                   | ${undefined}
        ${'project/*.json'}                    | ${'project'} | ${'cfg.json'}                   | ${'*.json'}
        ${'*/*.json'}                          | ${'project'} | ${'cfg.json'}                   | ${'*.json'}
        ${'*/src/**/*.js'}                     | ${'project'} | ${'src/cfg.js'}                 | ${'src/**/*.js'}
        ${'**/project/src/**/*.js'}            | ${'project'} | ${'!src/cfg.js'}                | ${'**/project/src/**/*.js'}
        ${'**/{node_modules,node_modules/**}'} | ${''}        | ${'x/node_modules/cs/pkg.json'} | ${'**/{node_modules,node_modules/**}'}
    `('rebaseGlob "$glob" to "$base" with file "$file"', ({ glob, base, file, expected }) => {
        const r = rebaseGlob(glob, base);
        expect(r).toEqual(expected);
        if (r) {
            const shouldMatch = !file.startsWith('!');
            const filename = file.replace(/!$/, '');
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mm.isMatch(filename, r)).toBe(shouldMatch);
        }
    });

    test.each`
        glob                                          | expected
        ${''}                                         | ${''}
        ${'\t# hello'}                                | ${''}
        ${'\t\\# hello '}                             | ${'\\# hello'}
        ${' *.js \n'}                                 | ${'*.js'}
        ${' space after\\  # comment '}               | ${'space after\\ '}
        ${' \\ space before and after\\  # comment '} | ${'\\ space before and after\\ '}
        ${'\\'}                                       | ${'\\'}
        ${'\\a'}                                      | ${'\\a'}
    `('trimGlob "$glob"', ({ glob, expected }) => {
        expect(trimGlob(glob)).toBe(expected);
    });

    interface TestNormalizeGlobToRoot {
        globPath: { glob: GlobPatternNormalized; path: PathInterface };
        file: string;
        root: string;
        expected: GlobPatternNormalized;
    }

    test.each`
        globPath                                                  | file                      | root                             | expected                                                                  | comment
        ${gp('*.json')}                                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: '.', ...relGlob }, path)}                    | ${'matching root'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: '.' }, pathPosix)}                           | ${'matching root'}
        ${gp('*.json', '.', pathWin32)}                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: '.' }, pathWin32)}                           | ${'matching root'}
        ${gp('*.json')}                                           | ${'cspell-glob/cfg.json'} | ${'..'}                          | ${eg({ glob: 'cspell-glob/*.json', root: '..' }, path)}                   | ${'root above'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cspell/cfg.json'}      | ${'..'}                          | ${eg({ glob: 'cspell/*.json', root: '..' }, pathPosix)}                   | ${'root above'}
        ${gp('*.json', '.', pathWin32)}                           | ${'cspell/cfg.json'}      | ${'..'}                          | ${eg({ glob: 'cspell/*.json', root: '..' }, pathWin32)}                   | ${'root above'}
        ${gp('*.json')}                                           | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: '.' }, path)}                                | ${'root below, cannot change'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: '.' }, pathPosix)}                           | ${'root below, cannot change'}
        ${gp('**/*.json', '.', pathWin32)}                        | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '**/*.json', root: 'deeper', ...globalGlob }, pathWin32)}    | ${'root below, globstar'}
        ${gp('deeper/*.json')}                                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper' }, path)}                           | ${'root below, matching'}
        ${gp('deeper/*.json', '.', pathPosix)}                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper' }, pathPosix)}                      | ${'root below, matching'}
        ${gp('deeper/*.json', '.', pathWin32)}                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper' }, pathWin32)}                      | ${'root below, matching'}
        ${gp('deeper/*.json', 'e:/user/Test/project', pathWin32)} | ${'cfg.json'}             | ${'E:/user/test/project/deeper'} | ${eg({ glob: '*.json', root: 'E:/user/test/project/deeper' }, pathWin32)} | ${'root below, matching'}
        ${gp('**/deeper/*.json')}                                 | ${'deeper/cfg.json'}      | ${'deeper'}                      | ${eg({ glob: '**/deeper/*.json', root: 'deeper', ...globalGlob }, path)}  | ${'root below, not matching'}
        ${gp('**/deeper/*.json', 'proj/nested')}                  | ${'deeper/cfg.json'}      | ${'proj'}                        | ${eg({ glob: '**/deeper/*.json', root: 'proj', ...globalGlob }, path)}    | ${'root below, not matching'}
        ${gp('**/deeper/*.json')}                                 | ${'!cfg.json'}            | ${'deeper'}                      | ${eg({ glob: '**/deeper/*.json', root: 'deeper', ...globalGlob }, path)}  | ${'root below, not matching'}
        ${gp('deeper/project/*/*.json')}                          | ${'cfg.json'}             | ${'deeper/project/a'}            | ${eg({ glob: '*.json', root: 'deeper/project/a' }, path)}                 | ${'root below, not matching'}
    `(
        'normalizeGlobToRoot orig {$globPath.glob.glob, $globPath.glob.root} $root $comment',
        ({ globPath, file, root, expected }: TestNormalizeGlobToRoot) => {
            const path: PathInterface = globPath.path;
            const glob: GlobPatternWithRoot = globPath.glob;
            root = path.resolve(root);
            const shouldMatch = !file.startsWith('!');
            file = file.replace(/^!/, '');
            file = path.relative(root, path.resolve(root, file)).replace(/\\/g, '/');

            const result = normalizeGlobToRoot(glob, root, path);
            expect(result).toEqual(expected);
            expect(mm.isMatch(file, result.glob)).toBe(shouldMatch);
        }
    );

    interface TestCase {
        globs: GlobPatternWithOptionalRoot[];
        root: string;
        expectedGlobs: GlobPatternNormalized[];
        comment: string;
    }

    test.each`
        globs                                                   | root         | expectedGlobs                                                                                   | comment
        ${mg('*.json')}                                         | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json', root: '.' }))}                                         | ${'*.json'}
        ${['*.json']}                                           | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json', root: '.' }))}                                         | ${'*.json'}
        ${mg('!*.json')}                                        | ${'.'}       | ${e(mGlob('!*.json', { rawGlob: '!*.json' }))}                                                  | ${'!*.json'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json' }), mGlob('*.ts'))}                                     | ${'*.json,*.ts'}
        ${j(mg('/node_modules', 'project/a'), mg('*.ts', '.'))} | ${'project'} | ${e(mGlob(gg('node_modules', 'node_modules/**'), { rawGlob: '/node_modules' }), mGlob('*.ts'))} | ${'/node_modules'}
        ${j(mg('!/node_modules', 'project/a'))}                 | ${'project'} | ${e(mGlob(gg('!node_modules', '!node_modules/**'), { rawGlob: '!/node_modules' }))}             | ${'!/node_modules'}
        ${j(mg('*/*.json', '.'))}                               | ${'project'} | ${e(mGlob(gg('*/*.json', '*/*.json/**'), { root: '.' }))}                                       | ${'*/*.json'}
        ${mg('node_modules')}                                   | ${'project'} | ${e(mGlob('node_modules', { rawGlob: 'node_modules' }))}                                        | ${'node_modules'}
        ${mg('/node_modules')}                                  | ${'project'} | ${e(mGlob(gg('node_modules', 'node_modules/**'), { rawGlob: '/node_modules' }))}                | ${'/node_modules'}
        ${mg('node_modules/')}                                  | ${'project'} | ${e(mGlob(gg('**/node_modules/**/*'), { rawGlob: 'node_modules/' }))}                           | ${'node_modules/'}
        ${mg('/node_modules/')}                                 | ${'project'} | ${e(mGlob(gg('node_modules/**/*'), { rawGlob: '/node_modules/' }))}                             | ${'/node_modules/'}
        ${mg({ glob: '/node_modules/' })}                       | ${'project'} | ${e(mGlob(gg('node_modules/**/*'), { rawGlob: '/node_modules/' }))}                             | ${'/node_modules/'}
        ${mg('i18/en_US')}                                      | ${'project'} | ${e(mGlob(gg('i18/en_US', 'i18/en_US/**'), { rawGlob: 'i18/en_US' }))}                          | ${'i18/en_US'}
    `('tests normalization nested "$comment" root: "$root"', ({ globs, root, expectedGlobs }: TestCase) => {
        root = path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: true, nodePath: path });
        expect(r).toEqual(expectedGlobs);
    });

    test.each`
        globs                                                   | root         | expectedGlobs                                                                                          | comment
        ${mg('*.json')}                                         | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json' }))}                                                           | ${'Glob with same root'}
        ${mg('**')}                                             | ${'.'}       | ${e(mGlob(gg('**'), globalGlob))}                                                                      | ${'**'}
        ${mg('node_modules/**')}                                | ${'.'}       | ${e(gg('node_modules/**'))}                                                                            | ${'node_modules/**'}
        ${mg('!*.json')}                                        | ${'.'}       | ${e(mGlob('!*.json', { rawGlob: '!*.json' }))}                                                         | ${'Negative glob'}
        ${mg('!*.json', 'project/a')}                           | ${'.'}       | ${e(mGlob(gg('!project/a/**/*.json', '!project/a/**/*.json/**'), { rawGlob: '!*.json', root: '.' }))}  | ${'Negative in Sub dir glob.'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'.'}       | ${e(mGlob(gg('project/a/**/*.json', 'project/a/**/*.json/**'), { rawGlob: '*.json' }), mGlob('*.ts'))} | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json' }), mGlob('*.ts', { rawGlob: '*.ts' }))}                       | ${''}
        ${mg('*.json')}                                         | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json' }))}                                                           | ${'Root deeper than glob'}
        ${mg('!*.json')}                                        | ${'project'} | ${e(mGlob('!*.json', { rawGlob: '!*.json' }))}                                                         | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'project'} | ${e(mGlob(gg('a/**/*.json', 'a/**/*.json/**'), { rawGlob: '*.json' }), mGlob('*.ts'))}                 | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'), mg('*.ts', '.'))} | ${'project'} | ${e(mGlob(gg('a/node_modules', 'a/node_modules/**'), { rawGlob: '/node_modules' }), mGlob('*.ts'))}    | ${'/node_modules'}
        ${j(mg('!/node_modules', 'project/a'))}                 | ${'project'} | ${e(mGlob(gg('!a/node_modules', '!a/node_modules/**'), { rawGlob: '!/node_modules' }))}                | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json' }), mGlob('*.ts'))}                                            | ${''}
        ${j(mg('*.json', '../tests/a'))}                        | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json', root: '../tests/a' }))}                                       | ${''}
        ${j(mg('*/*.json', 'project/a'))}                       | ${'project'} | ${e(gg('a/*/*.json', 'a/*/*.json/**'))}                                                                | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                               | ${'project'} | ${e(gg('*.json', '*.json/**'))}                                                                        | ${'nested */*.json'}
    `('tests normalization to root nested  "$comment" root: "$root"', ({ globs, root, expectedGlobs }: TestCase) => {
        root = path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: true, nodePath: path }).map((p) =>
            normalizeGlobToRoot(p, root, path)
        );
        expect(r).toEqual(expectedGlobs);
    });

    test.each`
        globs                                             | root             | expectedGlobs                                                          | comment
        ${mg('*.json')}                                   | ${'.'}           | ${e(mGlob(gg('*.json'), { rawGlob: '*.json' }))}                       | ${'Glob with same root'}
        ${mg('**')}                                       | ${'.'}           | ${e(mGlob(gg('**'), globalGlob))}                                      | ${'**'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}  | ${'.'}           | ${e(mGlob(gg('project/a/*.json'), { rawGlob: '*.json' }), gg('*.ts'))} | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))} | ${'.'}           | ${e(mGlob(gg('*.json'), { root: '../tests/a' }), gg('*.ts'))}          | ${'Glob not in root is not changed.'}
        ${mg('*.json')}                                   | ${'project'}     | ${e(mGlob(gg('*.json'), { root: '.' }))}                               | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'))}                   | ${'project'}     | ${e(mGlob(gg('a/*.json'), { rawGlob: '*.json' }))}                     | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'))}            | ${'project'}     | ${e(mGlob(gg('a/node_modules'), { rawGlob: '/node_modules' }))}        | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'))}                  | ${'project'}     | ${e({ glob: '*.json', root: '../tests/a' })}                           | ${'Glob not in root is not changed.'}
        ${j(mg('**/*.ts', '.'))}                          | ${'project'}     | ${e({ glob: '**/*.ts', root: 'project' })}                             | ${'Glob not in root is not changed.'}
        ${j(mg('/**/*.ts', '.'))}                         | ${'project'}     | ${e({ glob: '**/*.ts', root: 'project' })}                             | ${'Glob not in root is not changed.'}
        ${j(mg('*/*.json', '../tests/a'))}                | ${'project'}     | ${e({ glob: '*/*.json', root: '../tests/a' })}                         | ${'Glob not in root is not changed.'}
        ${j(mg('*/*.json', 'project/a'))}                 | ${'project'}     | ${e({ glob: 'a/*/*.json', root: 'project' })}                          | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                         | ${'project'}     | ${e({ glob: '*.json', root: 'project' })}                              | ${'nested */*.json'}
        ${j(mg('project/*/*.json', '.'))}                 | ${'project/sub'} | ${e({ glob: '*.json', root: 'project/sub' })}                          | ${'nested project/*/*.json'}
        ${j(mg('node_modules', '.'))}                     | ${'.'}           | ${e({ glob: 'node_modules', root: '.' })}                              | ${'node_modules'}
        ${j(mg('node_modules/', '.'))}                    | ${'.'}           | ${e({ glob: 'node_modules/**/*', root: '.' })}                         | ${'node_modules/'}
    `('tests normalization to root not nested "$comment" root: "$root"', ({ globs, root, expectedGlobs }: TestCase) => {
        root = path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: false, nodePath: path }).map((p) =>
            normalizeGlobToRoot(p, root, path)
        );
        try {
            expect(r).toEqual(expectedGlobs);
        } catch (e) {
            console.log('%o', globs);
            throw e;
        }
        const again = normalizeGlobPatterns(r, { root, nested: false, nodePath: path }).map((p) =>
            normalizeGlobToRoot(p, root, path)
        );
        expect(again).toEqual(r);
    });

    function nOpts(opts: Partial<NormalizeOptions> = {}): Required<NormalizeOptions> {
        const { nodePath = pathPosix } = opts;
        const { root = nodePath.resolve(), cwd = nodePath.resolve(), nested = false } = opts;
        return { root, cwd, nested, nodePath };
    }

    function gN(glob: string, root: string, rawGlob: string, rawRoot: string): GlobPatternNormalized {
        return { glob, root, rawGlob, rawRoot, isGlobalPattern: glob.replace(/^!+/g, '').startsWith('**') };
    }

    test.each`
        glob                                         | options                         | expected
        ${'*.ts'}                                    | ${nOpts()}                      | ${[gN('*.ts', nOpts().root, '*.ts', nOpts().root)]}
        ${'${cwd}/*.ts'}                             | ${nOpts()}                      | ${[gN('*.ts', nOpts().root, '${cwd}/*.ts', nOpts().root)]}
        ${'${cwd}/*.ts'}                             | ${nOpts({ nested: true })}      | ${[gN('*.ts', nOpts().root, '${cwd}/*.ts', nOpts().root), gN('*.ts/**', nOpts().root, '${cwd}/*.ts', nOpts().root)]}
        ${{ glob: '*.ts', root: '' }}                | ${nOpts()}                      | ${[gN('*.ts', nOpts().root, '*.ts', '')]}
        ${{ glob: '*.ts', root: '${cwd}/a' }}        | ${nOpts()}                      | ${[gN('*.ts', nOpts().nodePath.resolve('a'), '*.ts', '${cwd}/a')]}
        ${{ glob: '*.ts', root: '${cwd}/a' }}        | ${nOpts({ root: 'myRoot' })}    | ${[gN('*.ts', nOpts().nodePath.resolve('a'), '*.ts', '${cwd}/a')]}
        ${{ glob: '*.ts', root: '${cwd}/a' }}        | ${nOpts({ cwd: 'myCwd' })}      | ${[gN('*.ts', nOpts().nodePath.resolve('myCwd/a'), '*.ts', '${cwd}/a')]}
        ${{ glob: '${cwd}/*.ts', root: 'a' }}        | ${nOpts({ cwd: 'myCwd' })}      | ${[gN('*.ts', nOpts().nodePath.resolve('myCwd'), '${cwd}/*.ts', 'a')]}
        ${{ glob: 'a/*.ts', root: '${cwd}/myRoot' }} | ${nOpts({ root: 'otherRoot' })} | ${[gN('a/*.ts', nOpts().nodePath.resolve('myRoot'), 'a/*.ts', '${cwd}/myRoot')]}
    `('normalizeGlobPattern glob: "$glob", options: $options', ({ glob, options, expected }) => {
        expect(normalizeGlobPattern(glob, options)).toEqual(expected);
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
        ${'**'}                | ${'packages/code/package.json'}       | ${{}}                  | ${true}  | ${''}
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

function makePathInterface(nodePath: PathInterface, cwd: string): PathInterface {
    const prefix = nodePath.sep === '/' ? '/' : 'E:/';
    const root = nodePath.normalize(prefix + 'Users/user/project/cspell');
    cwd = nodePath.resolve(root, cwd);

    return {
        sep: nodePath.sep,
        normalize: (p) => nodePath.normalize(p),
        join: (...paths) => nodePath.join(...paths),
        isAbsolute: (p) => nodePath.isAbsolute(p),
        relative: (from, to) => nodePath.relative(from, to),
        resolve: (...paths: string[]) => {
            return nodePath.resolve(cwd, ...paths);
        },
    };
}

function gg(...globs: string[]) {
    return globs.map((glob) => ({ glob }));
}

function mGlob(g: KnownGlob | Partial<GlobPatternNormalized>[], ...toApply: Partial<GlobPatternNormalized>[]) {
    const globs = typeof g == 'string' ? knownGlobs[g] : g;
    return globs.map((glob) => toApply.reduce((a: Partial<GlobPatternNormalized>, b) => ({ ...a, ...b }), glob));
}
