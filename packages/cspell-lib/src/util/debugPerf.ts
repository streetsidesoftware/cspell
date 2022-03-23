import { createTimer } from './timer';

/**
 * Measure and log result.
 * @param fn - function to measure.
 * @param message - message to log
 * @param callback - called when the function has finished.
 * @returns a function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function perfFn<P extends any[], R>(
    fn: (...args: P) => R,
    message: string,
    callback: (m: string, elapsedMs: number) => void = (message, time) =>
        console.error(`${message}: ${time.toFixed(2)}ms`)
): (...args: P) => R {
    return (...args: P) => {
        const timer = createTimer();
        const r = fn(...args);
        callback(message, timer.elapsed());
        return r;
    };
}
