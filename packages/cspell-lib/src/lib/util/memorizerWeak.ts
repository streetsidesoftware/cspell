// prettier-ignore
export function memorizerWeak<T, K extends object>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T;
// prettier-ignore
export function memorizerWeak<T, K0 extends object, K1 extends object>(fn: (...p: [K0, K1]) => T): (...p: [K0, K1]) => T;
// prettier-ignore
export function memorizerWeak<T, K0 extends object, K1 extends object, K2 extends object>(fn: (...p: [K0, K1, K2]) => T): (...p: [K0, K1, K2]) => T;
// prettier-ignore
export function memorizerWeak<T, K0 extends object, K1 extends object, K2 extends object, K3 extends object>(fn: (...p: [K0, K1, K2, K3]) => T): (...p: [K0, K1, K2, K3]) => T;
// prettier-ignore
export function memorizerWeak<T, K0 extends object>(fn: (...p: [K0]) => T): (...p: [K0]) => T;
// prettier-ignore
export function memorizerWeak<T, K extends object>(fn: (...p: [...K[]]) => T): (...p: [...K[]]) => T {
    type N = WeakM<T, K>;
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
            n.c = n.c || new WeakMap<K, N>();
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

interface WeakM<T, K extends object> {
    v?: T;
    c?: WeakMap<K, WeakM<T, K>>;
}
