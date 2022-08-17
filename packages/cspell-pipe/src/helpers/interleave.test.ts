import { interleave } from './interleave';

describe('distribute', () => {
    test.each`
        a                  | b                       | expected
        ${[1, 2, 3]}       | ${[-1, -2, -3]}         | ${[1, -1, 2, -2, 3, -3]}
        ${[]}              | ${[-1, -2, -3]}         | ${[-1, -2, -3]}
        ${[1, 2, 3]}       | ${[]}                   | ${[1, 2, 3]}
        ${[1, 2, 3, 4, 5]} | ${[-1, -2, -3]}         | ${[1, -1, 2, -2, 3, -3, 4, 5]}
        ${[1, 2, 3]}       | ${[-1, -2, -3, -4, -5]} | ${[1, -1, 2, -2, 3, -3, -4, -5]}
    `('interleave $a $b', ({ a, b, expected }) => {
        expect([...interleave(a, b)]).toEqual(expected);

        const c = toIterable([1, 2, 3]);
        const c1 = [...c];
        const c2 = [...c];
        expect(c1).not.toEqual(c2);
    });
});

function* toIterable<T>(a: Iterable<T>): Iterable<T> {
    yield* a;
}
