import * as index from '.';

describe('index', () => {
    test('verify api', () => {
        const exports = Object.keys(index);
        expect(exports.sort()).toMatchSnapshot();
    });
});
