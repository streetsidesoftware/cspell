import * as index from './index';

describe('Validate index loads', () => {
    test('the modules is ok', () => {
        expect(index).toBeDefined();
        expect(index.GlobMatcher).toBeDefined();
        expect(typeof index.fileOrGlobToGlob).toBe('function');
    });

    test('API', () => {
        expect(index).toMatchSnapshot();
    });
});
