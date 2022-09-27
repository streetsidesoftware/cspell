import { memorizer, callOnce, memorizerAll } from './Memorizer';

describe('Validate Memorizer', () => {
    test('the memorizer works', () => {
        const counts = new Map<number, number>();
        const fn = (a: number) => {
            counts.set(a, (counts.get(a) || 0) + 1);
            return a;
        };
        const calc = memorizer(fn);
        const fnTest = (v: number, expected: number, repeat: number) => {
            for (; repeat > 0; repeat--) {
                expect(calc(v)).toBe(v);
                expect(counts.get(v)).toBe(expected);
            }
        };

        fnTest(5, 1, 5);
        fnTest(6, 1, 5);
        fnTest(0, 1, 5);
    });

    test('cache reset dual cache', () => {
        const counts = new Map<number, number>();
        const fn = (a: number) => {
            const v = (counts.get(a) || 0) + 1;
            counts.set(a, v);
            return v;
        };
        const calc = memorizer(fn, 2);
        expect(calc(5)).toBe(1);
        expect(calc(5)).toBe(1);
        expect(calc(6)).toBe(1);
        expect(calc(0)).toBe(1);
        expect(calc(0)).toBe(1);
        expect(calc(5)).toBe(1);
        expect(calc(6)).toBe(1);
        expect(calc(0)).toBe(1);
    });
});

describe('Validate Memorizer Dual Cache', () => {
    const counts = new Map<string, number>();
    const fn = (a: string) => {
        const v = (counts.get(a) || 0) + 1;
        counts.set(a, v);
        return v;
    };
    const calc = memorizer(fn, 2);

    test.each`
        value  | expected
        ${'a'} | ${1}
        ${'b'} | ${1}
        ${'c'} | ${1}
        ${'b'} | ${1}
        ${'a'} | ${1}
        ${'c'} | ${1}
        ${'d'} | ${1}
        ${'e'} | ${1}
        ${'a'} | ${1}
        ${'b'} | ${2}
        ${'c'} | ${2}
    `('cache reset dual cache $value $expected', ({ value, expected }) => {
        expect(calc(value)).toBe(expected);
        expect(calc(value)).toBe(expected);
    });
});

describe('callOnce', () => {
    test.each`
        value
        ${undefined}
        ${'hello'}
        ${42}
        ${null}
        ${0}
    `('callOnce "$value"', ({ value }) => {
        let calls = 0;
        const calc = () => (++calls, value);
        const fn = callOnce(calc);
        expect(fn()).toBe(value);
        expect(fn()).toBe(value);
        expect(fn()).toBe(value);
        expect(fn()).toBe(value);
        expect(calls).toBe(1);
    });
});

describe('memorizerAll', () => {
    it('memorizerAll', () => {
        function echo(...a: (string | number | undefined)[]): (string | number | undefined)[] {
            return a;
        }

        const mock = jest.fn(echo);
        const fn = memorizerAll(mock);
        expect(fn('a')).toEqual(['a']);
        expect(fn('b')).toEqual(['b']);
        expect(fn('a', 'b')).toEqual(['a', 'b']);
        expect(fn('a', 'b')).toEqual(['a', 'b']);
        expect(fn(undefined)).toEqual([undefined]);
        expect(fn('b')).toEqual(['b']);
        expect(fn(undefined)).toEqual([undefined]);
        expect(fn('a')).toEqual(['a']);
        expect(mock).toHaveBeenCalledTimes(4);
        expect(mock).toHaveBeenLastCalledWith(undefined);
    });
});
