const _hrTime: HRTimeFn = process?.hrtime || polyHrTime;

export interface Timer {
    /** Start / restart the timer. */
    start(): void;
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    elapsed(): number;
}

export function createTimer(hrTimeFn = _hrTime): Timer {
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

export type HRTimeFn = (time?: HRTime) => HRTime;

export type HRTime = [number, number];

export function toMilliseconds(t: HRTime): number {
    return (t[0] + t[1] * 1e-9) * 1000;
}

export function polyHrTime(time?: HRTime): HRTime {
    const now = Date.now() - (time ? toMilliseconds(time) : 0);
    const inSeconds = now * 1.0e-3;
    const s = Math.floor(inSeconds);
    const n = (inSeconds - s) * 1.0e9;
    return [s, n];
}
