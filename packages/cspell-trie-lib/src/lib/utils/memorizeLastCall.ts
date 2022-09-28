const SymEmpty = Symbol('memorizeLastCall');

export function memorizeLastCall<P, R>(fn: (p: P) => R): (p: P) => R {
    let lastP: P | undefined = undefined;
    let lastR: R | typeof SymEmpty = SymEmpty;
    function calc(p: P): R {
        if (lastR !== SymEmpty && lastP === p) return lastR;
        lastP = p;
        lastR = fn(p);
        return lastR;
    }

    return calc;
}
