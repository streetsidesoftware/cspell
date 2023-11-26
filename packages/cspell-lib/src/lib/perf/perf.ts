class PerfMonitor {
    private _enabled = false;

    constructor(private _performance: Performance = performance) {}

    mark(name: string) {
        this._enabled && this._performance.mark(name);
    }

    measure(name: string, startMark: string, endMark: string) {
        this._enabled && this._performance.measure(name, startMark, endMark);
    }

    clearMarks(name?: string) {
        this._enabled && this._performance.clearMarks(name);
    }

    clearMeasures(name?: string) {
        this._enabled && this._performance.clearMeasures(name);
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }
}

export const perf = new PerfMonitor();
