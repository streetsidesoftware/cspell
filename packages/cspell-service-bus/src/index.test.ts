import * as index from './index';

describe('index', () => {
    test('API', () => {
        expect(new Map(Object.entries(index).map(([key, value]) => [key, typeof value]))).toMatchSnapshot();
    });
});
