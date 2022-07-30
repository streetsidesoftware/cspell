import * as index from './index';

describe('index', () => {
    test('API', () => {
        const api = Object.entries(index)
            .map(([key, value]) => `${key} => ${typeof value}`)
            .sort();
        expect(api).toMatchSnapshot();
    });
});
