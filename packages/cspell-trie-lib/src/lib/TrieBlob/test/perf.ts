export function measure<R>(name: string, fn: () => R): R {
    const start = performance.now();
    const r = fn();
    const end = performance.now();
    console.log(`${name} ${(end - start).toFixed(3)} milliseconds.`);
    return r;
}
