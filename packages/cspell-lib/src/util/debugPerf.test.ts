import { perfFn } from './debugPerf';

describe('debugPerf', () => {
    test('perfFn with callback', () => {
        const mock = jest.fn();
        const fn = perfFn(() => undefined, 'message', mock);
        fn();
        expect(mock).toHaveBeenCalledWith(expect.stringContaining('message'), expect.any(Number));
    });

    test('perfFn default callback', () => {
        const mock = jest.spyOn(console, 'error').mockImplementation();
        const fn = perfFn(() => undefined, 'message');
        fn();
        expect(mock).toHaveBeenCalledWith(expect.stringContaining('message'));
    });
});
