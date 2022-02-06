import { memorizer } from './memorizer';

describe('memorizer', () => {
    test('memorizer', () => {
        const transform = (...args: string[]) => args.reduce((sum, s) => (sum += s.length), 0);

        const fn = jest.fn(transform);

        const m = memorizer(fn);

        const requests: string[][] = [['a'], ['a', 'b', 'c'], ['a'], ['a', 'b', 'c']];

        const expected = [...new Set(requests.map((r) => r.join('|')))].map((r) => r.split('|'));

        requests.forEach((r) => expect(m(...r)).toBe(transform(...r)));

        expect(fn.mock.calls).toEqual(expected);
    });

    test('mixed params', () => {
        function transform(...params: [a: string, ai: number, b: string, bi?: number | undefined]): string {
            const [a, ai, b, bi] = params;
            return `${a}: ${ai.toFixed(2)}, ${b}: ${bi?.toFixed(2) || '<>'}`;
        }

        const fn = jest.fn(transform);

        const m = memorizer(fn);

        const requests: Parameters<typeof transform>[] = [
            ['a', 23, 'b', undefined],
            ['a', 23, 'b'],
            ['a', 23, 'b', undefined],
            ['a', 23, 'b'],
            ['a', 23, 'b'],
            ['b', 42, 'c', 10],
            ['a', 23, 'b', undefined],
            ['b', 42, 'c', 10],
        ];

        const expected = [
            ['a', 23, 'b', undefined],
            ['a', 23, 'b'],
            ['b', 42, 'c', 10],
        ];

        requests.forEach((r) => expect(m(...r)).toBe(transform(...r)));

        expect(fn.mock.calls).toEqual(expected);
    });
});
