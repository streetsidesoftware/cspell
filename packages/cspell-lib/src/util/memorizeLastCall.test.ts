import { memorizeLastCall } from './memorizeLastCall';

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
