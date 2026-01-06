export function measurePerfStart(name: string): void {
    performance.mark(name + '-start');
}

export function measurePerfEnd(name: string): void {
    performance.mark(name + '-end');
    performance.measure(name, name + '-start', name + '-end');
}

/**
 * Creates performance marks and measures the time taken between them.
 * @param name - name of the performance entry
 * @returns a function to stop the timer.
 */
export function measurePerf(name: string): () => void {
    measurePerfStart(name);
    return () => {
        measurePerfEnd(name);
    };
}

/**
 * Measure the performance of a function.
 * @param name - name of the performance entry
 * @param fn - function to measure
 * @returns the result of the function
 */
export function measurePerfFn<R>(name: string, fn: () => R): R {
    const perfEnd = measurePerf(name);
    try {
        return fn();
    } finally {
        perfEnd();
    }
}
