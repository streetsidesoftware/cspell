import * as index from './index';

describe('index', () => {
    test('exports', () => {
        expect(index.readFile).toBeDefined();
    });

    test('api', () => {
        const api = Object.entries(index)
            .map(([key, value]) => `${key} => ${typeof value}`)
            .sort();
        expect(api).toMatchSnapshot();
    });
});
