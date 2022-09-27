import * as pipe from '.';

describe('Pipe Sync API', () => {
    test('pipe api', () => {
        expect(Object.keys(pipe).sort()).toMatchSnapshot();
    });
});
