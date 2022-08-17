import { opMap, opTake } from '../operators';
import { pipeSync } from '../pipe';
import { toDistributableIterable } from './distribute';
import { interleave } from './interleave';

describe('distribute', () => {
    test.each`
        iter                     | expected
        ${[1, 2]}                | ${[3, 4]}
        ${[1, 2, 3]}             | ${[3, 4, 9]}
        ${toIterable([1, 2, 3])} | ${[3, 4, 9]}
    `('toDistributableIterable interleave', ({ iter, expected }) => {
        const dIter = toDistributableIterable<number>(iter);
        const a = pipeSync(
            dIter,
            opMap((a) => a * 3)
        );
        const b = pipeSync(
            dIter,
            opMap((a) => a * 2)
        );
        const r = [...interleave(a, b)];
        expect(r).toEqual(expected);
    });

    test('It is consumed by the first usage.', () => {
        const src = [1, 2, 3];
        const c = toDistributableIterable(src);
        const c1 = [...c];
        const c2 = [...c];
        expect(c1).toEqual(src);
        expect(c1).not.toEqual(c2);
        expect(c2).toHaveLength(0);
    });

    test('Serial consumers', () => {
        const src = [1, 2, 3, 4, 5];
        const c = toDistributableIterable(src);
        const c1 = [...pipeSync(c, opTake(2))];
        const c2 = [...c];
        expect(c1).toEqual(src.slice(0, 2));
        expect(c2).toEqual(src.slice(2));
    });

    test('toIterable', () => {
        const src = [1, 2, 3];
        const c = toIterable(src);
        const c1 = [...c];
        const c2 = [...c];
        expect(c1).toEqual(src);
        expect(c1).not.toEqual(c2);
        expect(c2).toHaveLength(0);
    });
});

function* toIterable<T>(a: Iterable<T>): Iterable<T> {
    yield* a;
}
