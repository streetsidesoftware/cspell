import { ScopePool } from './scope';

describe('scope', () => {
    it('ScopePool', () => {
        const pool = new ScopePool();
        const scopeVal1 = 'punctuation.definition.comment.ts comment.line.ts code.ts source.ts';
        const scope1 = pool.parseScope(scopeVal1);
        expect(scope1?.value).toBe('punctuation.definition.comment.ts');
        const scope2 = pool.parseScope(scopeVal1.split(' ').reverse(), true);
        expect(scope2).toBe(scope1);
        expect(scope2?.toString()).toBe(scopeVal1);
    });
});
