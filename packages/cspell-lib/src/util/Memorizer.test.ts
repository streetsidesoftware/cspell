import { memorizer } from './Memorizer';

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
