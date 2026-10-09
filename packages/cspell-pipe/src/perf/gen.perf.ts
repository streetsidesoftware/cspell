import { suite } from 'perf-insight';

suite('generators vs iterators', async (test) => {
    const data = Array.from({ length: 10_000 }, (_, i) => i);

    function double(v: number) {
        return v * 2;
    }

    test('generator', () => {
        return testIterable(genValues(data, double));
    });

    test('iterator', () => {
        return testIterable(iterValues(data, double));
    });

    function testIterable(iter: Iterable<number>) {
        let sum = 0;
        for (const v of iter) {
            sum += v;
        }
        return sum;
    }
});

function* genValues(i: Iterable<number>, fnMap: (v: number) => number) {
    for (const v of i) {
        yield fnMap(v);
    }
}

function iterValues(i: Iterable<number>, fnMap: (v: number) => number): Iterable<number> {
    return {
        [Symbol.iterator]: () => {
            const iter = i[Symbol.iterator]();
            function next() {
                const { done, value } = iter.next();
                if (done) return { done, value: undefined };
                return { value: fnMap(value) };
            }
            return {
                next,
            };
        },
    };
}
