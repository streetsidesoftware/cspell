import { memorizeLastCall } from './memorizeLastCall';

describe('memorizeLastCall', () => {
    test('memorizeLastCall', () => {
        let calls = 0;
        function x2(v: number | string): number | string {
            ++calls;
            return typeof v === 'string' ? v + v : v + v;
        }

        const fn = memorizeLastCall(x2);

        expect(fn(2)).toBe(4);
        expect(calls).toBe(1);
        expect(fn(2)).toBe(4);
        expect(calls).toBe(1);
        expect(fn('ab')).toBe('abab');
        expect(calls).toBe(2);
        expect(fn('ab')).toBe('abab');
        expect(calls).toBe(2);
        expect(fn(2)).toBe(4);
        expect(calls).toBe(3);
        expect(fn(2)).toBe(4);
        expect(calls).toBe(3);
    });
});
