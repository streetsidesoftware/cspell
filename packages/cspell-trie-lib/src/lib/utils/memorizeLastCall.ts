const SymEmpty = Symbol('memorizeLastCall');

export function memorizeLastCall<R>(fn: () => R): () => R;
export function memorizeLastCall<P, R>(fn: (p?: P) => R): (p?: P) => R;
export function memorizeLastCall<P, R>(fn: (p: P) => R): (p: P) => R;

export function memorizeLastCall<P, R>(fn: (p: P) => R): (p: P) => R {
    let lastP: P | undefined = undefined;
    let lastR: R | typeof SymEmpty = SymEmpty;
    function calc(p: P): R {
        if (lastP === p && lastR !== SymEmpty) return lastR;
        lastP = p;
        lastR = fn(p);
        return lastR;
    }

    return calc;
}
