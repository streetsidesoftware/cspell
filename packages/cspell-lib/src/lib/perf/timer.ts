// Symbol.dispose ??= Symbol('Symbol.dispose');
// Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export interface PerfTimer /* extends Disposable */ {
    readonly name: string;
    readonly startTime: number;
    readonly elapsed: number;
    start(): void;
    end(): void;
}

type TimeNowFn = () => number;

export function createPerfTimer(
    name: string,
    onEnd?: (elapsed: number, name: string) => void,
    timeNowFn?: TimeNowFn,
): PerfTimer {
    return new SimpleTimer(name, onEnd, timeNowFn);
}

class SimpleTimer implements PerfTimer {
    private _start = performance.now();
    private _elapsed: number | undefined = undefined;
    private _running = true;

    constructor(
        readonly name: string,
        readonly onEnd?: (elapsed: number, name: string) => void,
        readonly timeNowFn = performance.now,
    ) {}

    get startTime() {
        return this._start;
    }

    get elapsed() {
        return this._elapsed ?? performance.now() - this._start;
    }

    end() {
        if (!this._running) return;
        this._running = false;
        const end = performance.now();
        this._elapsed = end - this._start;
        this.onEnd?.(this._elapsed, this.name);
    }

    start() {
        this._start = performance.now();
        this._running = true;
    }

    // [Symbol.dispose]() {
    //     this.end();
    // }
}
