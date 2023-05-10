export function measure<R>(name: string, fn: () => R): R {
    const start = performance.now();
    const r = fn();
    const end = performance.now();
    const elapsed = (' '.repeat(16) + `${(end - start).toFixed(3)}ms.`).slice(-16);
    console.log(`${name} ${elapsed}`);
    return r;
}
