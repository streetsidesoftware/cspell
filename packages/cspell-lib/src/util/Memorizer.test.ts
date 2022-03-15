import { memorizer, memorizeLastCall, callOnce } from './Memorizer';

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

describe('memorizeLastCall', () => {
    test('memorizeLastCall simple', () => {
        function calc(v: number): number {
            return v * 2;
        }

        const fn = jest.fn(calc);
        const m = memorizeLastCall(fn);

        const calls = [1, 1, 2, 1, 3, 3, 3, 3, 2, 1];
        calls.forEach((call) => m(call));

        expect(fn.mock.calls).toEqual([[1], [2], [1], [3], [2], [1]]);
    });

    test('memorizeLastCall two params', () => {
        function calc(letter: string, repeat: number): string {
            return letter.repeat(repeat);
        }

        const fn = jest.fn(calc);
        const m = memorizeLastCall(fn);

        m('h', 1);
        m('h', 1);
        m('a', 2);
        m('h', 1);
        m('a', 2);
        m('a', 2);
        m('a', 3);
        m('a', 3);
        m('a', 2);

        expect(fn.mock.calls).toEqual([
            ['h', 1],
            ['a', 2],
            ['h', 1],
            ['a', 2],
            ['a', 3],
            ['a', 2],
        ]);
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
