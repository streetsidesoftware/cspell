const _hrTime: HRTimeFn = process?.hrtime || polyHrTime;

export interface Timer {
    /** Start / restart the timer. */
    start(): void;
    /**
     * Calculate the amount of time in ms since the
     * timer was created / started.
     */
    elapsed(): number;
    /**
     * Calculate the amount of time in ms since the
     * end of the last lap.
     */
    lap(): number;
}

export function createTimer(hrTimeFn = _hrTime): Timer {
    let start: HRTime = hrTimeFn();
    let lastLap = 0;
    function elapsed() {
        return toMilliseconds(hrTimeFn(start));
    }

    return {
        start() {
            start = hrTimeFn();
            lastLap = 0;
        },
        elapsed,
        lap() {
            const now = elapsed();
            const diff = now - lastLap;
            lastLap = now;
            return diff;
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

export interface LapRecorder {
    times: [name: string, lapTime: number, totalTime: number][];
    lap(name: string): void;
    report(): string[];
}

export function createLapRecorder(): LapRecorder {
    const timer = createTimer();
    const times: [string, number, number][] = [];
    let lapTime = 0;
    function lap(name: string) {
        const now = timer.elapsed();
        const diff = now - lapTime;
        times.push([name, diff, now]);
        lapTime = diff;
    }
    function report() {
        return times.map(([name, time]) => `${name}: ${time.toFixed(2)}`);
    }
    return {
        times,
        lap,
        report,
    };
}
