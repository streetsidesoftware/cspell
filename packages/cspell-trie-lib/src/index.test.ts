import * as lib from '.';

describe('Validate index.ts', () => {
    test('index', () => {
        expect(typeof lib.Trie).toBe('function');
    });
});
