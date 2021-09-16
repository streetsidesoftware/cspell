import { hrtime } from 'process';

export interface Timer {
    /** Start / restart the timer. */
    start(): void;
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    elapsed(): number;
}

export function createTimer(hrTimeFn = hrtime): Timer {
    let start: HRTime = hrTimeFn();

    return {
        start() {
            start = hrTimeFn();
        },
        elapsed() {
            return toMilliseconds(hrTimeFn(start));
        },
    };
}

export type HRTime = [number, number];

export function toMilliseconds(t: HRTime): number {
    return (t[0] + t[1] * 1e-9) * 1000;
}
