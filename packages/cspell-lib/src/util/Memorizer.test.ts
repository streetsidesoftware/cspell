import {expect} from 'chai';
import { memorizer } from './Memorizer';

describe('Validate Memorizer', () => {
    test('Test the memorizer works', () => {
        const counts = new Map<number, number>();
        const fn = (a: number) => {
            counts.set(a, (counts.get(a) || 0) + 1);
            return a;
        };
        const calc = memorizer(fn);
        const fnTest = (v: number, expected: number, repeat: number) => {
            for (; repeat > 0; repeat--) {
                expect(calc(v)).to.be.equal(v);
                expect(counts.get(v)).to.be.equal(expected);
            }
        };

        fnTest(5, 1, 5);
        fnTest(6, 1, 5);
        fnTest(0, 1, 5);
    });

    test('Test cache reset', () => {
        const counts = new Map<number, number>();
        const fn = (a: number) => {
            counts.set(a, (counts.get(a) || 0) + 1);
            return a;
        };
        const calc = memorizer(fn, 2);
        const fnTest = (v: number, expected: number, repeat: number) => {
            for (; repeat > 0; repeat--) {
                expect(calc(v)).to.be.equal(v);
                expect(counts.get(v)).to.be.equal(expected);
            }
        };

        fnTest(5, 1, 5);
        fnTest(6, 1, 5);
        fnTest(0, 1, 5);
        fnTest(5, 2, 5);
        fnTest(6, 2, 5);
        fnTest(0, 2, 5);
    });
});
