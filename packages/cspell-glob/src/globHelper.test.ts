import * as Path from 'node:path';
import { posix, win32 } from 'node:path';

import { FileUrlBuilder, isUrlLike } from '@cspell/url';
import mm from 'micromatch';
import { describe, expect, test } from 'vitest';

import type { NormalizeOptions } from './globHelper.js';
import {
    __testing__,
    fileOrGlobToGlob,
    normalizeGlobPattern,
    normalizeGlobPatterns,
    normalizeGlobToRoot,
} from './globHelper.js';
import type {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes.js';

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

    function pp(root: string): string {
        return p(root, posix);
    }

    function pw(root: string): string {
        return p(root, win32);
    }

    test.each`
        file                                         | root   | path     | expected                                          | comment
        ${'node_modules/**'}                         | ${'.'} | ${posix} | ${g('node_modules/**', pp('./'))}                 | ${'posix'}
        ${'*.json'}                                  | ${'.'} | ${posix} | ${g('*.json', pp('./'))}                          | ${'posix'}
        ${'*.json'}                                  | ${'.'} | ${win32} | ${g('*.json', pw('./'))}                          | ${'win32'}
        ${'**/*.json'}                               | ${'.'} | ${posix} | ${g('**/*.json', pp('./'), true)}                 | ${'posix'}
        ${'**/*.json'}                               | ${'.'} | ${win32} | ${g('**/*.json', pw('./'), true)}                 | ${'win32'}
        ${pp('./*.json')}                            | ${'.'} | ${posix} | ${g('/*.json', pp('./'))}                         | ${''}
        ${pw('./*.json')}                            | ${'.'} | ${win32} | ${g('/*.json', pw('./'))}                         | ${''}
        ${pp('./package.json')}                      | ${'.'} | ${posix} | ${g('/package.json', pp('./'))}                   | ${''}
        ${pw('.\\package.json')}                     | ${'.'} | ${win32} | ${g('/package.json', pw('./'))}                   | ${''}
        ${pp('./package.json')}                      | ${'.'} | ${posix} | ${g('/package.json', pp('./'))}                   | ${''}
        ${'.\\package.json'}                         | ${'.'} | ${win32} | ${g('/package.json', pw('./'))}                   | ${''}
        ${'./a/package.json'}                        | ${'.'} | ${posix} | ${g('/a/package.json', pp('./'))}                 | ${''}
        ${pw('.\\a\\package.json')}                  | ${'.'} | ${win32} | ${g('/package.json', pw('./a/'))}                 | ${''}
        ${'/user/tester/projects'}                   | ${'.'} | ${posix} | ${g('/projects', pp('/user/tester/'))}            | ${'Directory not matching root.'}
        ${'C:\\user\\tester\\projects'}              | ${'.'} | ${win32} | ${g('/projects', pw('C:/user/tester/'))}          | ${'Directory not matching root.'}
        ${'E:\\user\\projects\\spell\\package.json'} | ${'.'} | ${win32} | ${g('/package.json', pw('./spell/'))}             | ${'Directory matching root.'}
        ${'e:\\user\\projects\\spell\\package.json'} | ${'.'} | ${win32} | ${g('/package.json', pw('./spell/'))}             | ${'Directory matching root.'}
        ${'/user/tester/projects/**/*.json'}         | ${'.'} | ${posix} | ${g('**/*.json', pp('/user/tester/projects/'))}   | ${'A glob like path not matching the root.'}
        ${'C:\\user\\tester\\projects\\**\\*.json'}  | ${'.'} | ${win32} | ${g('**/*.json', pw('C:/user/tester/projects/'))} | ${'A glob like path not matching the root.'}
    `('fileOrGlobToGlob file: $file root: $root $comment', ({ file, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(file, root, path);
        expect(r).toEqual(expected);
    });

    test.each`
        file        | root                   | path         | expected                           | comment
        ${'*.json'} | ${uph('.', pathPosix)} | ${pathPosix} | ${g('*.json', p('./', pathPosix))} | ${'posix'}
        ${'*.json'} | ${uph('.', pathWin32)} | ${pathWin32} | ${g('*.json', p('./', pathWin32))} | ${'win32'}
    `('fileOrGlobToGlob file: $file root: $root $comment', ({ file, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(file, root, path || Path);
        expect(r).toEqual(expected);
    });

    test.each`
        glob                                             | root       | path     | expected                               | comment
        ${{ glob: '*.json' }}                            | ${'.'}     | ${posix} | ${g('*.json', pp('./'))}               | ${'posix'}
        ${{ glob: '../*.json' }}                         | ${'.'}     | ${posix} | ${g('/*.json', pp('../'))}             | ${'posix'}
        ${{ glob: '*.json', root: pp('./data') }}        | ${'.'}     | ${posix} | ${g('*.json', pp('./data/'))}          | ${'posix'}
        ${{ glob: '**/*.json' }}                         | ${'.'}     | ${posix} | ${g('**/*.json', pp('./'), true)}      | ${'posix'}
        ${{ glob: '**/*.json', root: pp('./data') }}     | ${'.'}     | ${posix} | ${g('**/*.json', pp('./data/'), true)} | ${'posix'}
        ${{ glob: '**/*.json', isGlobalPattern: false }} | ${'.'}     | ${posix} | ${g('**/*.json', pp('./'))}            | ${'posix'}
        ${{ glob: '../**/*.json' }}                      | ${'./a/b'} | ${posix} | ${g('**/*.json', pp('./a/'))}          | ${'posix'}
        ${{ glob: '/**/*.json' }}                        | ${'.'}     | ${posix} | ${g('/**/*.json', pp('./'))}           | ${'posix'}
        ${{ glob: '/**/*.json', root: pp('./data') }}    | ${'.'}     | ${posix} | ${g('/**/*.json', pp('./data/'))}      | ${'posix'}
        ${{ glob: '*.json', root: '${cwd}' }}            | ${'.'}     | ${posix} | ${g('*.json', '${cwd}')}               | ${'posix'}
        ${{ glob: '${cwd}/*.json', root: pp('./data') }} | ${'.'}     | ${posix} | ${g('/*.json', '${cwd}')}              | ${'posix'}
    `('fileOrGlobToGlob glob: $glob root: $root $comment', ({ glob, root, path, expected }) => {
        root = p(root, path);
        const r = fileOrGlobToGlob(glob, root, path);
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
        nodePath: PathInterface = Path,
    ): GlobPatternWithRoot {
        root = nodePath.normalize(nodePath.resolve(root || '.') + '/');
        source = nodePath.join(root, source);
        pattern = typeof pattern === 'string' ? { glob: pattern } : pattern;
        const isGlobalPattern = isGlobalGlob(pattern.glob);
        root = nodePath.normalize((pattern.root ?? root) + nodePath.sep);
        return { source, ...pattern, root, isGlobalPattern };
    }

    interface GlobNPath {
        glob: GlobPatternWithRoot;
        path: PathInterface;
    }
    function gp(pattern: GlobPattern, root?: string, nodePath: PathInterface = Path): GlobNPath {
        return {
            glob: g(pattern, root, undefined, nodePath),
            path: nodePath,
        };
    }

    function mg(
        patterns: GlobPattern | GlobPattern[],
        root?: string,
        source = 'cspell.json',
        nodePath = Path,
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

        return [...patterns, ...flatten()];
    }

    function eg(e: Partial<GlobPatternNormalized>, path: PathInterface) {
        const p: Partial<GlobPatternNormalized> = {};
        if (e.root) {
            const suffix = '/';
            p.root = path.normalize(path.resolve(e.root) + suffix);
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

        return [...flatten()].map((e) => eg(e, Path));
    }

    test.each`
        glob                                   | globRoot     | root         | file                            | expected
        ${'**/*.json'}                         | ${''}        | ${''}        | ${'cfg.json'}                   | ${'**/*.json'}
        ${'**/*.json'}                         | ${''}        | ${''}        | ${'project/cfg.json'}           | ${'**/*.json'}
        ${'*.json'}                            | ${''}        | ${''}        | ${'cfg.json'}                   | ${'*.json'}
        ${'*.json'}                            | ${''}        | ${''}        | ${'!cfg.js'}                    | ${'*.json'}
        ${'package.json'}                      | ${'.'}       | ${'.'}       | ${'package.json'}               | ${'package.json'}
        ${'*/package.json'}                    | ${'.'}       | ${'.'}       | ${'config/package.json'}        | ${'*/package.json'}
        ${'**/*.json'}                         | ${'.'}       | ${'project'} | ${'cfg.json'}                   | ${'**/*.json'}
        ${'*.json'}                            | ${'.'}       | ${'project'} | ${'cfg.json'}                   | ${'../*.json'}
        ${'project/*.json'}                    | ${'.'}       | ${'project'} | ${'cfg.json'}                   | ${'*.json'}
        ${'*/*.json'}                          | ${'.'}       | ${'project'} | ${'cfg.json'}                   | ${'*.json'}
        ${'*/src/**/*.js'}                     | ${'.'}       | ${'project'} | ${'src/cfg.js'}                 | ${'src/**/*.js'}
        ${'**/project/src/**/*.js'}            | ${'project'} | ${'.'}       | ${'!src/cfg.js'}                | ${'project/**/project/src/**/*.js'}
        ${'**/project/src/**/*.js'}            | ${''}        | ${'project'} | ${'!src/cfg.js'}                | ${'**/project/src/**/*.js'}
        ${'**/{node_modules,node_modules/**}'} | ${''}        | ${''}        | ${'x/node_modules/cs/pkg.json'} | ${'**/{node_modules,node_modules/**}'}
    `('rebaseGlob $glob to $globRoot, $root with file $file', ({ glob, globRoot, root, file, expected }) => {
        root = posix.resolve(root);
        globRoot = posix.resolve(globRoot);
        const relRootToGlob = posix.relative(root, globRoot);
        const relGlobToRoot = posix.relative(globRoot, root);
        const r = rebaseGlob(glob, relRootToGlob, relGlobToRoot);
        expect(r).toEqual(expected);
        if (!r.startsWith('../')) {
            const shouldMatch = !file.startsWith('!');
            const filename = file.replace(/!$/, '');

            expect(mm.isMatch(filename, r)).toBe(shouldMatch);
        }
    });

    test.each`
        glob                                   | globRoot        | root          | expected
        ${'**/*.json'}                         | ${'.'}          | ${'.'}        | ${'**/*.json'}
        ${'*.json'}                            | ${'.'}          | ${'.'}        | ${'*.json'}
        ${'package.json'}                      | ${'.'}          | ${'proj'}     | ${'../package.json'}
        ${'package.json'}                      | ${'proj'}       | ${'.'}        | ${'proj/package.json'}
        ${'*/package.json'}                    | ${'.'}          | ${'proj'}     | ${'package.json'}
        ${'**/*.json'}                         | ${'.'}          | ${'proj'}     | ${'**/*.json'}
        ${'**/*.json'}                         | ${'proj'}       | ${'.'}        | ${'proj/**/*.json'}
        ${'*.json'}                            | ${'project'}    | ${'project'}  | ${'*.json'}
        ${'*.json'}                            | ${'../project'} | ${'../test'}  | ${'../project/*.json'}
        ${'/*.json'}                           | ${'../project'} | ${'../test'}  | ${'../project/*.json'}
        ${'**/*.json'}                         | ${'project'}    | ${'test'}     | ${'../project/**/*.json'}
        ${'project/*.json'}                    | ${'.'}          | ${'project/'} | ${'*.json'}
        ${'*/*.json'}                          | ${'.'}          | ${'project/'} | ${'*.json'}
        ${'*/src/**/*.js'}                     | ${'.'}          | ${'project/'} | ${'src/**/*.js'}
        ${'src/**/*.js'}                       | ${'project'}    | ${'test'}     | ${'../project/src/**/*.js'}
        ${'**/project/src/**/*.js'}            | ${'.'}          | ${'project'}  | ${'**/project/src/**/*.js'}
        ${'**/{node_modules,node_modules/**}'} | ${''}           | ${''}         | ${'**/{node_modules,node_modules/**}'}
    `('rebaseGlob $glob to $globRoot -> $root', ({ glob, globRoot, root, expected }) => {
        root = posix.resolve(root);
        globRoot = posix.resolve(globRoot);
        const relRootToGlob = posix.relative(root, globRoot);
        const relGlobToRoot = posix.relative(globRoot, root);
        const r = rebaseGlob(glob, relRootToGlob, relGlobToRoot);
        expect(r).toEqual(expected);
    });

    test.each`
        glob                                          | expected
        ${''}                                         | ${''}
        ${'\t# hello'}                                | ${''}
        ${'# hello'}                                  | ${''}
        ${'\t\\# hello '}                             | ${'\\# hello'}
        ${' *.js \n'}                                 | ${'*.js'}
        ${' space after\\  # comment '}               | ${'space after\\ '}
        ${' \\ space before and after\\  # comment '} | ${'\\ space before and after\\ '}
        ${'\\'}                                       | ${'\\'}
        ${'\\a'}                                      | ${'\\a'}
    `('trimGlob $glob', ({ glob, expected }) => {
        expect(trimGlob(glob)).toBe(expected);
    });

    interface TestNormalizeGlobToRoot {
        globPath: { glob: GlobPatternNormalized; path: PathInterface };
        file: string;
        root: string;
        expected: GlobPatternNormalized;
    }

    test.each`
        globPath                                                  | file                      | root                             | expected                                                                   | comment
        ${gp('*.json')}                                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: './', ...relGlob }, Path)}                    | ${'matching root'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: './' }, pathPosix)}                           | ${'matching root'}
        ${gp('*.json', '.', pathWin32)}                           | ${'cfg.json'}             | ${'.'}                           | ${eg({ glob: '*.json', root: './' }, pathWin32)}                           | ${'matching root'}
        ${gp('*.json')}                                           | ${'cspell-glob/cfg.json'} | ${'..'}                          | ${eg({ glob: 'cspell-glob/*.json', root: '../' }, Path)}                   | ${'root above'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cspell/cfg.json'}      | ${'..'}                          | ${eg({ glob: 'cspell/*.json', root: '../' }, pathPosix)}                   | ${'root above'}
        ${gp('*.json', '.', pathWin32)}                           | ${'cspell/cfg.json'}      | ${'..'}                          | ${eg({ glob: 'cspell/*.json', root: '../' }, pathWin32)}                   | ${'root above'}
        ${gp('*.json')}                                           | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '../*.json', root: 'deeper/' }, Path)}                        | ${'root below, cannot change'}
        ${gp('*.json', '.', pathPosix)}                           | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '../*.json', root: 'deeper/' }, pathPosix)}                   | ${'root below, cannot change'}
        ${gp('**/*.json', '.', pathWin32)}                        | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '**/*.json', root: 'deeper/', ...globalGlob }, pathWin32)}    | ${'root below, globstar'}
        ${gp('deeper/*.json')}                                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper/' }, Path)}                           | ${'root below, matching'}
        ${gp('deeper/*.json', '.', pathPosix)}                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper/' }, pathPosix)}                      | ${'root below, matching'}
        ${gp('deeper/*.json', '.', pathWin32)}                    | ${'cfg.json'}             | ${'deeper'}                      | ${eg({ glob: '*.json', root: 'deeper/' }, pathWin32)}                      | ${'root below, matching'}
        ${gp('deeper/*.json', 'e:/user/Test/project', pathWin32)} | ${'cfg.json'}             | ${'E:/user/test/project/deeper'} | ${eg({ glob: '*.json', root: 'E:/user/test/project/deeper/' }, pathWin32)} | ${'root below, matching'}
        ${gp('**/deeper/*.json')}                                 | ${'deeper/cfg.json'}      | ${'deeper'}                      | ${eg({ glob: '**/deeper/*.json', root: 'deeper/', ...globalGlob }, Path)}  | ${'root below, not matching'}
        ${gp('**/deeper/*.json', 'proj/nested')}                  | ${'deeper/cfg.json'}      | ${'proj'}                        | ${eg({ glob: '**/deeper/*.json', root: 'proj/', ...globalGlob }, Path)}    | ${'root below, not matching'}
        ${gp('**/deeper/*.json')}                                 | ${'!cfg.json'}            | ${'deeper'}                      | ${eg({ glob: '**/deeper/*.json', root: 'deeper/', ...globalGlob }, Path)}  | ${'root below, not matching'}
        ${gp('deeper/project/*/*.json')}                          | ${'cfg.json'}             | ${'deeper/project/a'}            | ${eg({ glob: '*.json', root: 'deeper/project/a/' }, Path)}                 | ${'root below, not matching'}
    `(
        'normalizeGlobToRoot orig {$globPath.glob.glob, $globPath.glob.root} $root $comment',
        ({ globPath, file, root, expected }: TestNormalizeGlobToRoot) => {
            const path: PathInterface = globPath.path;
            const builder = getFileUrlBuilder(path);
            const glob: GlobPatternWithRoot = globPath.glob;
            root = path.resolve(root);
            const rootURL = builder.toFileDirURL(root);
            const shouldMatch = !file.startsWith('!');

            const result = normalizeGlobToRoot(glob, root, path);

            expect(result).toEqual(expected);

            file = file.replace(/^!/, '');
            file = builder.relative(rootURL, builder.toFileURL(file, rootURL));

            !result.glob.startsWith('../') && expect(mm.isMatch(file, result.glob)).toBe(shouldMatch);
        },
    );

    test.each`
        globPath                                                  | file          | root                             | expected                                                                   | comment
        ${gp('deeper/*.json', 'e:/user/Test/project', pathWin32)} | ${'cfg.json'} | ${'E:/user/test/project/deeper'} | ${eg({ glob: '*.json', root: 'E:/user/test/project/deeper/' }, pathWin32)} | ${'root below, matching'}
    `(
        'normalizeGlobToRoot orig {$globPath.glob.glob, $globPath.glob.root} $root $comment',
        ({ globPath, file, root, expected }: TestNormalizeGlobToRoot) => {
            const path: PathInterface = globPath.path;
            const builder = getFileUrlBuilder(path);
            const glob: GlobPatternWithRoot = globPath.glob;
            root = path.resolve(root);
            const rootURL = builder.toFileDirURL(root);
            const shouldMatch = !file.startsWith('!');

            const result = normalizeGlobToRoot(glob, root, path);

            expect(result).toEqual(expected);

            file = file.replace(/^!/, '');
            file = builder.relative(rootURL, builder.toFileURL(file, rootURL));

            expect(mm.isMatch(file, result.glob)).toBe(shouldMatch);
        },
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
    `('tests normalization nested $comment root: $root', ({ globs, root, expectedGlobs }: TestCase) => {
        root = Path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: true, nodePath: Path });
        expect(r).toEqual(expectedGlobs);
    });

    test.each`
        globs                                                   | root         | expectedGlobs                                                                                          | comment
        ${mg('*.json')}                                         | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json' }))}                                                           | ${'Glob with same root'}
        ${mg('**')}                                             | ${'.'}       | ${e(mGlob(gg('**'), globalGlob))}                                                                      | ${'**'}
        ${mg('node_modules/**')}                                | ${'.'}       | ${e(gg('node_modules/**'))}                                                                            | ${'node_modules/**'}
        ${mg('!*.json')}                                        | ${'.'}       | ${e(mGlob('!*.json', { rawGlob: '!*.json' }))}                                                         | ${'Negative glob'}
        ${mg('!*.json', 'project/a')}                           | ${'.'}       | ${e(mGlob(gg('!project/a/**/*.json', '!project/a/**/*.json/**'), { rawGlob: '!*.json', root: './' }))} | ${'Negative in Sub dir glob.'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'.'}       | ${e(mGlob(gg('project/a/**/*.json', 'project/a/**/*.json/**'), { rawGlob: '*.json' }), mGlob('*.ts'))} | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'.'}       | ${e(mGlob('*.json', { rawGlob: '*.json' }), mGlob('*.ts', { rawGlob: '*.ts' }))}                       | ${''}
        ${mg('*.json')}                                         | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json' }))}                                                           | ${'Root deeper than glob'}
        ${mg('!*.json')}                                        | ${'project'} | ${e(mGlob('!*.json', { rawGlob: '!*.json' }))}                                                         | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}        | ${'project'} | ${e(mGlob(gg('a/**/*.json', 'a/**/*.json/**'), { rawGlob: '*.json' }), mGlob('*.ts'))}                 | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'), mg('*.ts', '.'))} | ${'project'} | ${e(mGlob(gg('a/node_modules', 'a/node_modules/**'), { rawGlob: '/node_modules' }), mGlob('*.ts'))}    | ${'/node_modules'}
        ${j(mg('!/node_modules', 'project/a'))}                 | ${'project'} | ${e(mGlob(gg('!a/node_modules', '!a/node_modules/**'), { rawGlob: '!/node_modules' }))}                | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))}       | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json' }), mGlob('*.ts'))}                                            | ${''}
        ${j(mg('*.json', '../tests/a'))}                        | ${'project'} | ${e(mGlob('*.json', { rawGlob: '*.json', root: '../tests/a/' }))}                                      | ${''}
        ${j(mg('*/*.json', 'project/a'))}                       | ${'project'} | ${e(gg('a/*/*.json', 'a/*/*.json/**'))}                                                                | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                               | ${'project'} | ${e(gg('*.json', '*.json/**'))}                                                                        | ${'nested */*.json'}
    `('tests normalization to root nested  $comment root: $root', ({ globs, root, expectedGlobs }: TestCase) => {
        root = Path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: true, nodePath: Path }).map((p) =>
            normalizeGlobToRoot(p, root, Path),
        );
        expect(r).toEqual(expectedGlobs);
    });

    test.each`
        globs                                             | root             | expectedGlobs                                                          | comment
        ${mg('*.json')}                                   | ${'.'}           | ${e(mGlob(gg('*.json'), { rawGlob: '*.json' }))}                       | ${'Glob with same root'}
        ${mg('**')}                                       | ${'.'}           | ${e(mGlob(gg('**'), globalGlob))}                                      | ${'**'}
        ${j(mg('*.json', 'project/a'), mg('*.ts', '.'))}  | ${'.'}           | ${e(mGlob(gg('project/a/*.json'), { rawGlob: '*.json' }), gg('*.ts'))} | ${'Sub dir glob.'}
        ${j(mg('*.json', '../tests/a'), mg('*.ts', '.'))} | ${'.'}           | ${e(mGlob(gg('*.json'), { root: '../tests/a/' }), gg('*.ts'))}         | ${'Glob not in root is not changed.'}
        ${mg('*.json')}                                   | ${'project'}     | ${e(mGlob(gg('../*.json'), { root: './project/' }))}                   | ${'Root deeper than glob'}
        ${j(mg('*.json', 'project/a'))}                   | ${'project'}     | ${e(mGlob(gg('a/*.json'), { rawGlob: '*.json' }))}                     | ${'Root in the middle.'}
        ${j(mg('/node_modules', 'project/a'))}            | ${'project'}     | ${e(mGlob(gg('a/node_modules'), { rawGlob: '/node_modules' }))}        | ${'Root in the middle. /node_modules'}
        ${j(mg('*.json', '../tests/a'))}                  | ${'project'}     | ${e({ glob: '*.json', root: '../tests/a/' })}                          | ${'Glob not in root is not changed.'}
        ${j(mg('**/*.ts', '.'))}                          | ${'project'}     | ${e({ glob: '**/*.ts', root: 'project/' })}                            | ${'Glob not in root is not changed.'}
        ${j(mg('/**/*.ts', '.'))}                         | ${'project'}     | ${e({ glob: '**/*.ts', root: 'project/' })}                            | ${'Glob not in root is not changed.'}
        ${j(mg('*/*.json', '../tests/a'))}                | ${'project'}     | ${e({ glob: '*/*.json', root: '../tests/a/' })}                        | ${'Glob not in root is not changed.'}
        ${j(mg('*/*.json', 'project/a'))}                 | ${'project'}     | ${e({ glob: 'a/*/*.json', root: 'project/' })}                         | ${'nested a/*/*.json'}
        ${j(mg('*/*.json', '.'))}                         | ${'project'}     | ${e({ glob: '*.json', root: 'project/' })}                             | ${'nested */*.json'}
        ${j(mg('project/*/*.json', '.'))}                 | ${'project/sub'} | ${e({ glob: '*.json', root: 'project/sub/' })}                         | ${'nested project/*/*.json'}
        ${j(mg('node_modules', '.'))}                     | ${'.'}           | ${e({ glob: 'node_modules', root: './' })}                             | ${'node_modules'}
        ${j(mg('node_modules/', '.'))}                    | ${'.'}           | ${e({ glob: 'node_modules/**/*', root: './' })}                        | ${'node_modules/'}
    `('tests normalization to root not nested $comment root: $root', ({ globs, root, expectedGlobs }: TestCase) => {
        root = Path.resolve(root);
        const r = normalizeGlobPatterns(globs, { root, nested: false, nodePath: Path }).map((p) => {
            return normalizeGlobToRoot(p, root, Path);
        });
        try {
            expect(r).toEqual(expectedGlobs);
        } catch (e) {
            console.error('%o', globs);
            throw e;
        }
        const again = normalizeGlobPatterns(r, { root, nested: false, nodePath: Path }).map((p) =>
            normalizeGlobToRoot(p, root, Path),
        );
        expect(again).toEqual(r);
    });

    function nOpts(opts: Partial<NormalizeOptions> = {}): Required<NormalizeOptions> {
        const { nodePath = pathPosix } = opts;
        const { root = nodePath.resolve(), cwd = nodePath.resolve(), nested = false } = opts;
        return { root, cwd, nested, nodePath };
    }

    function gN(glob: string, root: string, rawGlob: string, rawRoot: string): GlobPatternNormalized {
        root = nOpts().nodePath.normalize(root + '/');
        return { glob, root, rawGlob, rawRoot, isGlobalPattern: glob.replaceAll(/^!+/g, '').startsWith('**') };
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
    `('normalizeGlobPattern glob: $glob, options: $options', ({ glob, options, expected }) => {
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
        'assume glob $pattern matches $file is $expected - $comment',
        ({ pattern, file, options, expected }: TestCase) => {
            const r = mm.isMatch(file, pattern, options);
            expect(r).toBe(expected);
        },
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
        relative: (...p) => nodePath.relative(...p),
        parse: (...p) => nodePath.parse(...p),
        resolve: (...paths: string[]) => {
            return nodePath.resolve(cwd, ...paths);
        },
    };
}

function p(root: string, p?: PathInterface | undefined): string {
    if (isUrlLike(root)) return root;
    const cwd = p === win32 ? 'E:\\user\\projects' : p === posix ? '/User/projects' : undefined;
    p ??= Path;
    const suffix = /[/\\]$/.test(root) ? p.sep : '';
    return ((cwd && p.resolve(cwd, root)) || p.resolve(root)) + suffix;
}

function gg(...globs: string[]) {
    return globs.map((glob) => ({ glob }));
}

function mGlob(g: KnownGlob | Partial<GlobPatternNormalized>[], ...toApply: Partial<GlobPatternNormalized>[]) {
    const globs = typeof g == 'string' ? knownGlobs[g] : g;
    return globs.map((glob) => toApply.reduce((a: Partial<GlobPatternNormalized>, b) => ({ ...a, ...b }), glob));
}

function getFileUrlBuilder(path?: PathInterface): FileUrlBuilder {
    return new FileUrlBuilder({ path });
}

// function u(file: string): URL {
//     return toFileURL(file);
// }

// function uh(path: string): string {
//     return u(path).href;
// }

function up(file: string, path?: PathInterface): URL {
    const builder = getFileUrlBuilder(path);
    return builder.toFileURL(file);
}

function uph(file: string, path: PathInterface | undefined): string {
    return up(file, path).href;
}
