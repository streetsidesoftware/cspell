import { memorizerWeak } from './memorizerWeak';

describe('memorizer Weak', () => {
    test('memorizer', () => {
        const transform = (...args: (readonly [string])[]) => args.reduce((sum, s) => (sum += s.length), 0);

        const fn = jest.fn(transform);

        const m = memorizerWeak(fn);

        const a = ['a'] as const;
        const b = ['b'] as const;
        const c = ['c'] as const;
        const aa = a.concat() as [string];

        const requests: (readonly [string])[][] = [];
        requests.push([a], [a, b, c], [a], [a, b, c]);
        requests.push([aa, b, c], [a, b, c], [aa], [a], [a, b, c]);

        const expected = [[a], [a, b, c], [aa, b, c], [aa]];

        requests.forEach((r) => expect(m(...r)).toBe(transform(...r)));

        expect(fn.mock.calls).toEqual(expected);
    });

    test('mixed params', () => {
        function transform(...params: [{ a: string; ai: number }, { b: string; bi?: number | undefined }]): string {
            const [{ a, ai }, { b, bi }] = params;
            return `${a}: ${ai.toFixed(2)}, ${b}: ${bi?.toFixed(2) || '<>'}`;
        }

        const fn = jest.fn(transform);

        const m = memorizerWeak(fn);

        const a23 = { a: 'a', ai: 23 };
        const bBbi = { b: 'b', bi: undefined };
        const bB = { b: 'b' };
        const aB42 = { a: 'b', ai: 42 };
        const bC10 = { b: 'c', bi: 10 };

        const requests: Parameters<typeof transform>[] = [
            [a23, bBbi],
            [a23, bB],
            [a23, bBbi],
            [a23, bB],
            [a23, bB],
            [aB42, bC10],
            [a23, bBbi],
            [aB42, bC10],
        ];

        const expected = [
            [a23, bBbi],
            [a23, bB],
            [aB42, bC10],
        ];

        requests.forEach((r) => expect(m(...r)).toBe(transform(...r)));

        expect(fn.mock.calls).toEqual(expected);
    });
});
