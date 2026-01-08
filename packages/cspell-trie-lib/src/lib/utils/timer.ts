export interface Timer {
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    (): number;
}

export function startTimer(): Timer {
    const start = performance.now();

    return () => performance.now() - start;
}
