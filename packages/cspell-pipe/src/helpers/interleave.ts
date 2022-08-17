export function* interleave<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
    const ai = a[Symbol.iterator]();
    const bi = b[Symbol.iterator]();

    for (let aNext = ai.next(); !aNext.done; aNext = ai.next()) {
        yield aNext.value;
        const bNext = bi.next();
        if (bNext.done) break;
        yield bNext.value;
    }

    for (let aNext = ai.next(); !aNext.done; aNext = ai.next()) {
        yield aNext.value;
    }

    for (let bNext = bi.next(); !bNext.done; bNext = bi.next()) {
        yield bNext.value;
    }
}
