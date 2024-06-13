import 'mocha';

import assert from 'node:assert';

import { testEach } from '../test-util/testEach.mjs';
import { AstScopeMatcher, parseScope, scopeItem } from './scope.mjs';

describe('scope', () => {
    testEach([
        {
            scope: 'YAMLPair[value] YAMLScalar',
            expected: [scopeItem('YAMLPair', 'value'), scopeItem('YAMLScalar')],
        },
        {
            scope: 'YAMLPair[key] YAMLScalar[value]',
            expected: [scopeItem('YAMLPair', 'key'), scopeItem('YAMLScalar', 'value')],
        },
        {
            scope: 'YAMLPair',
            expected: [scopeItem('YAMLPair')],
        },
    ])('parseScope $scope', ({ scope, expected }) => {
        assert.deepStrictEqual(parseScope(scope), expected);
    });

    testEach([
        { scope: 'YAMLScalar', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 2 },
        { scope: 'YAMLScalar[value]', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 3 },
        { scope: 'YAMLPair', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 0 },
        { scope: 'YAMLPair YAMLScalar', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 10 },
        { scope: 'YAMLPair[key] YAMLScalar', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 14 },
        { scope: 'YAMLPair[value] YAMLScalar', astScope: ['YAMLPair[key]', 'YAMLScalar'], expected: 0 },
    ])('score $scope', ({ scope, astScope, expected }) => {
        const s = AstScopeMatcher.fromScopeSelector(scope);
        assert.strictEqual(s.score(astScope), expected);
    });

    testEach([
        { scope: 'YAMLScalar', expected: 'value' },
        { scope: 'YAMLScalar[value]', expected: 'value' },
        { scope: 'YAMLPair[key]', expected: 'key' },
        { scope: 'YAMLPair[key] YAMLScalar[rawValue]', expected: 'rawValue' },
        { scope: '', expected: 'value' },
    ])('scope field $scope', ({ scope, expected }) => {
        const s = AstScopeMatcher.fromScopeSelector(scope);
        assert.equal(s.scopeField(), expected);
    });
});
