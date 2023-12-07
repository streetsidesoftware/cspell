interface PerfEntry {
    readonly entryType: string;
    readonly name: string;
    readonly startTime: number;
    readonly duration?: number | undefined;
}

interface PerfMark extends PerfEntry {
    readonly entryType: 'mark';
}

export class PerfMonitor {
    private _enabled = false;

    constructor(private _performance: Performance = performance) {}

    mark(name: string): PerfMark {
        const mark = ((this._enabled && this._performance.mark(name)) || {
            entryType: 'mark' as const,
            name,
            startTime: performance.now(),
        }) as PerfMark;
        return mark;
    }

    // measure(name: string, startMark: string, endMark: string) {
    //     return this._enabled && this._performance.measure(name, startMark, endMark);
    // }

    // clearMarks(name?: string) {
    //     this._enabled && this._performance.clearMarks(name);
    // }

    // clearMeasures(name?: string) {
    //     this._enabled && this._performance.clearMeasures(name);
    // }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }
}

export const perf = new PerfMonitor();
