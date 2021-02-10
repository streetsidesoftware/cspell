import * as path from 'path';
import { _testing_, calcGlobs, normalizeExcludeGlobsToRoot } from './glob';
import { GlobMatcher } from 'cspell-glob';
import mm = require('micromatch');
// import minimatch = require('minimatch');

const getStdinResult = {
    value: '',
};

jest.mock('get-stdin', () => {
    return jest.fn(() => Promise.resolve(getStdinResult.value));
});

describe('Validate internal functions', () => {
    test('normalizePattern relative', () => {
        const root = process.cwd();
        const r = _testing_.normalizePattern('../../packages/**/*.ts', root);
        expect(r.root).toBe(path.dirname(path.dirname(root)));
        expect(r.pattern).toBe('packages/**/*.ts');
    });

    test('normalizePattern relative absolute', () => {
        const root = process.cwd();
        const p = '/packages/**/*.ts';
        const r = _testing_.normalizePattern(p, root);
        expect(r.root).toBe(root);
        expect(r.pattern).toBe(p);
    });

    test('normalizePattern absolute', () => {
        const root = process.cwd();
        const p = path.join(__dirname, '**', '*.ts');
        const r = _testing_.normalizePattern(p, root);
        expect(r.root).toBe(path.sep);
        expect(r.pattern).toBe(p);
    });

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
        expectedGlob: string[];
        file: string;
        expectedToMatch: boolean;
    }

    test.each`
        glob               | globRoot          | root              | expectedGlob                            | file                                | expectedToMatch
        ${'*.json'}        | ${'.'}            | ${'.'}            | ${['**/{*.json,*.json/**}']}            | ${'./package.json'}                 | ${true}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/{*.json,*.json/**}']} | ${'./project/p1/package.json'}      | ${true}
        ${'*.json'}        | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/{*.json,*.json/**}']} | ${'./project/p1/src/package.json'}  | ${true}
        ${'*.json'}        | ${'.'}            | ${'./project/p2'} | ${['**/{*.json,*.json/**}']}            | ${'./project/p2/package.json'}      | ${true}
        ${'src/*.json'}    | ${'.'}            | ${'./project/p2'} | ${[]}                                   | ${''}                               | ${false}
        ${'**/src/*.json'} | ${'.'}            | ${'./project/p2'} | ${['**/src/*.json']}                    | ${'./project/p2/x/src/config.json'} | ${true}
        ${'**/src/*.json'} | ${'./project/p1'} | ${'.'}            | ${['project/p1/**/src/*.json']}         | ${'./project/p1/src/config.json'}   | ${true}
    `(
        'mapGlobToRoot "$glob"@"$globRoot" -> "@root" = "$expectedGlob"',
        ({ glob, globRoot, root, expectedGlob, file, expectedToMatch }: TestMapGlobToRoot) => {
            globRoot = path.resolve(globRoot);
            root = path.resolve(root);
            file = path.resolve(file);
            const globMatcher = new GlobMatcher(glob, globRoot);
            const patterns = globMatcher.patterns;
            const r = normalizeExcludeGlobsToRoot(patterns, root);
            expect(r).toEqual(expectedGlob);

            const relToRoot = path.relative(root, file);

            expect(globMatcher.match(file)).toBe(expectedToMatch);
            expect(mm.isMatch(relToRoot, expectedGlob)).toBe(expectedToMatch);
        }
    );
});
