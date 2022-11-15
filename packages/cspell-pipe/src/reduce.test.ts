import { toAsyncIterable } from './helpers';
import { reduce } from './reduce';

describe('reduce', () => {
    test('reduceSync', () => {
        expect(reduce([1, 2, 3], (a, b) => a + b)).toBe(6);
        expect(reduce([1], (a, b) => a + b)).toBe(1);
        expect(reduce([1, 2, 3], (a, b) => a + b, 10)).toBe(16);
        expect(reduce<number>([], (a, b) => a + b, 10)).toBe(10);
        expect(reduce<number>([], (a, b) => a + b)).toBe(undefined);
    });

    test('reduceAsync', async () => {
        expect(await reduce(toAsyncIterable([1, 2, 3]), (a, b) => a + b)).toBe(6);
        expect(await reduce(toAsyncIterable([1]), (a, b) => a + b)).toBe(1);
        expect(await reduce(toAsyncIterable([1, 2, 3]), (a, b) => a + b, 10)).toBe(16);
        expect(await reduce<number>(toAsyncIterable([]), (a, b) => a + b, 10)).toBe(10);
        expect(await reduce<number>(toAsyncIterable([]), (a, b) => a + b)).toBe(undefined);
    });
});
