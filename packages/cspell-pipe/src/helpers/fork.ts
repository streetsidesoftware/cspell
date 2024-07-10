export type ForkedIterables<T> = [Iterable<T>, Iterable<T>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emptyArray: Array<any> = [];

Object.freeze(emptyArray);

export function fork<T>(iterable: Iterable<T>): ForkedIterables<T> {
    let active = 3;

    interface BufClosure {
        buf: T[];
    }

    const bufA: BufClosure = { buf: [] };
    const bufB: BufClosure = { buf: [] };

    let iterator: Iterator<T> | undefined = undefined;

    function getIterator(): Iterator<T> {
        if (iterator) {
            return iterator;
        }
        return (iterator = iterable[Symbol.iterator]());
    }

    function* gen(mask: number, a: BufClosure, b: BufClosure): Iterable<T> {
        const cur = a.buf;
        const other = b.buf;
        const iter = getIterator();
        try {
            // We have to loop through the current buffer first.
            // It is necessary to use a loop in case the buffer is updated between yields.
            for (let i = 0; i < cur.length; i++) {
                yield cur[i];
            }
            cur.length = 0;
            let n: IteratorResult<T>;
            while (!(n = iter.next()).done) {
                if (active & mask) {
                    other.push(n.value);
                }
                yield n.value;
            }
        } catch (e) {
            if (iter.throw) {
                return iter.throw(e);
            }
            throw e;
        } finally {
            active &= mask;
            cur.length = 0;
            a.buf = emptyArray;
            if (!active) {
                iterator?.return?.();
            }
        }
    }

    return [gen(~1, bufA, bufB), gen(~2, bufB, bufA)];
}
