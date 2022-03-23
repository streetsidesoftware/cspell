// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memorizer<K extends any[], T>(fn: (...p: K) => T): (...p: K) => T {
    type N = M<K, T>;
    const r: N = {};

    function find(p: K): N | undefined {
        let n: N | undefined = r;
        for (const k of p) {
            if (!n) break;
            n = n.c?.get(k);
        }
        return n;
    }

    function set(p: K, v: T) {
        let n = r;
        for (const k of p) {
            const c = n.c?.get(k);
            if (c) {
                n = c;
                continue;
            }
            const r: N = {};
            n.c = n.c || new Map<K, N>();
            n.c.set(k, r);
            n = r;
        }
        n.v = v;
    }

    return (...p: K): T => {
        const f = find(p);
        if (f && 'v' in f) {
            return f.v;
        }
        const v = fn(...p);
        set(p, v);
        return v;
    };
}

interface M<Key, Value> {
    v?: Value;
    c?: Map<Key, M<Key, Value>>;
}
