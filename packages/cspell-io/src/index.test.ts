import * as index from './index';

describe('index', () => {
    test('exports', () => {
        expect(index.readFile).toBeDefined();
    });
});
