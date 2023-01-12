import * as index from './index';

describe('index', () => {
    test('verify api', () => {
        const exports = Object.keys(index);
        expect(exports.sort()).toMatchSnapshot();
    });
});
