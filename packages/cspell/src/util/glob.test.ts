import * as path from 'path';
import { _testing_, calcGlobs } from './glob';

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
});
