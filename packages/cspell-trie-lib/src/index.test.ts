import * as lib from './index';

describe('Validate index.ts', () => {
    test('index', () => {
        expect(typeof lib.Trie).toBe('function');
    });
    test('Track changes to the API.', () => {
        expect(Object.keys(lib).sort()).toMatchSnapshot();
    });
});
