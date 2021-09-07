export interface Timer {
    /** Start / restart the timer. */
    start(): void;
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    elapsed(): number;
}

export function createTimer(hrTime = process.hrtime): Timer {
    let start = hrTime();

    return {
        start() {
            start = hrTime();
        },
        elapsed() {
            return toMilliseconds(hrTime(start));
        },
    };
}

export type HRTime = [number, number];

export function toMilliseconds(t: HRTime): number {
    return (t[0] + t[1] * 1e-9) * 1000;
}
