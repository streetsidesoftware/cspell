export function memorizer<T, K>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T;
export function memorizer<T, K0, K1, K2, K3>(fn: (...p: [K0, K1, K2, K3]) => T): (...p: [K0, K1, K2, K3]) => T;
export function memorizer<T, K0, K1, K2>(fn: (...p: [K0, K1, K2]) => T): (...p: [K0, K1, K2]) => T;
export function memorizer<T, K0, K1>(fn: (...p: [K0, K1]) => T): (...p: [K0, K1]) => T;
export function memorizer<T, K0>(fn: (...p: [K0]) => T): (...p: [K0]) => T;
export function memorizer<T, K>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T {
    type N = M<T, K>;
    const r: N = {};

    function find(p: [...K[]]): N | undefined {
        let n: N | undefined = r;
        for (const k of p) {
            if (!n) break;
            n = n.c?.get(k);
        }
        return n;
    }

    function set(p: [...K[]], v: T) {
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

    return (...p: [...K[]]): T => {
        const f = find(p);
        if (f && 'v' in f) {
            return f.v;
        }
        const v = fn(...p);
        set(p, v);
        return v;
    };
}

interface M<T, K> {
    v?: T;
    c?: Map<K, M<T, K>>;
}
