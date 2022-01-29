import * as pipe from '.';

describe('Pipe API', () => {
    test('pipe api', () => {
        expect(Object.keys(pipe).sort()).toMatchSnapshot();
    });
});
