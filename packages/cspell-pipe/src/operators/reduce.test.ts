import { toAsyncIterable } from '../helpers';
import { toArrayAsync } from '../helpers/toArray';
import { opReduceAsync, opReduceSync } from './reduce';

describe('reduce', () => {
    test('opReduceSync with Init', () => {
        interface Stat {
            sum: number;
            count: number;
        }
        function collect(s: Stat, v: number): Stat {
            return {
                sum: s.sum + v,
                count: s.count + 1,
            };
        }

        const op = opReduceSync(collect, { sum: 0, count: 0 });
        expect([...op([1, 2, 3])]).toEqual([{ sum: 6, count: 3 }]);
        expect([...op([])]).toEqual([{ sum: 0, count: 0 }]);
    });

    test('opReduceSync without Init', () => {
        function sum(s: number, v: number): number {
            return s + v;
        }

        const opSum = opReduceSync(sum);
        expect([...opSum([1, 2, 3])]).toEqual([6]);
        expect([...opSum([5, 2, 3])]).toEqual([10]);
        expect([...opSum([5])]).toEqual([5]);
        expect([...opReduceSync(sum, 10)([5])]).toEqual([15]);
        expect([...opReduceSync(sum, 11)([1, 2, 3])]).toEqual([17]);
    });

    test('opReduceAsync with Init', async () => {
        interface Stat {
            sum: number;
            count: number;
        }
        function collect(s: Stat, v: number): Stat {
            return {
                sum: s.sum + v,
                count: s.count + 1,
            };
        }

        const op = opReduceAsync(collect, { sum: 0, count: 0 });
        expect(await toArrayAsync(op([1, 2, 3]))).toEqual([{ sum: 6, count: 3 }]);
        expect(await toArrayAsync(op([]))).toEqual([{ sum: 0, count: 0 }]);
        expect(await toArrayAsync(op(toAsyncIterable([1, 2, 3])))).toEqual([{ sum: 6, count: 3 }]);
    });

    test('opReduceAsync without Init', async () => {
        function sum(s: number, v: number): number {
            return s + v;
        }

        const opSum = opReduceAsync(sum);
        expect(await toArrayAsync(opSum([1, 2, 3]))).toEqual([6]);
        expect(await toArrayAsync(opSum([5, 2, 3]))).toEqual([10]);
        expect(await toArrayAsync(opSum([5]))).toEqual([5]);
        expect(await toArrayAsync(opReduceAsync(sum, 10)([5]))).toEqual([15]);
        expect(await toArrayAsync(opReduceAsync(sum, 11)([1, 2, 3]))).toEqual([17]);
    });
});
