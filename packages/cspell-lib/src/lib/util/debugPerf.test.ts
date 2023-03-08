import { describe, expect, test, vi } from 'vitest';

import { perfFn } from './debugPerf.js';

describe('debugPerf', () => {
    test('perfFn with callback', () => {
        const mock = vi.fn();
        const fn = perfFn(() => undefined, 'message', mock);
        fn();
        expect(mock).toHaveBeenCalledWith(expect.stringContaining('message'), expect.any(Number));
    });

    test('perfFn default callback', () => {
        const mock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const fn = perfFn(() => undefined, 'message');
        fn();
        expect(mock).toHaveBeenCalledWith(expect.stringContaining('message'));
    });
});
