import { perfFn } from './debugPerf';

describe('debugPerf', () => {
    test('perfFn', () => {
        const mock = jest.fn();
        const fn = perfFn(() => undefined, 'message', mock);
        fn();
        expect(mock).toHaveBeenCalledWith(expect.stringContaining('message'));
    });
});
