export function measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} ${(end - start).toFixed(3)} milliseconds.`);
}
