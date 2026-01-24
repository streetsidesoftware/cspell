const symbolCSpell = Symbol.for('cspell');

interface CSpellGlobalSettings {
    enablePerformanceMeasurements?: boolean;
}

type GlobalCSpell = typeof globalThis & { [symbolCSpell]?: CSpellGlobalSettings };

const globalThisCSpell: GlobalCSpell = globalThis;

export function measurePerfStart(name: string): void {
    _measurePerfStart(name, isEnabledPerformanceMeasurements());
}

export function measurePerfEnd(name: string): void {
    _measurePerfEnd(name, isEnabledPerformanceMeasurements());
}

function _measurePerfStart(name: string, enabled: boolean): void {
    if (!enabled) return;
    performance.mark(name + '-start');
}

function _measurePerfEnd(name: string, enabled: boolean): void {
    if (!enabled) return;
    performance.mark(name + '-end');
    performance.measure(name, name + '-start', name + '-end');
}

type DisposableFunction = (() => void) & Disposable & AsyncDisposable;

/**
 * Creates performance marks and measures the time taken between them.
 * @param name - name of the performance entry
 * @returns a function to stop the timer.
 */
export function measurePerf(name: string): DisposableFunction {
    // The enabled state is captured when measurePerf is called.
    const enabled = isEnabledPerformanceMeasurements();
    _measurePerfStart(name, enabled);
    return makeDisposableFunction(() => {
        _measurePerfEnd(name, enabled);
    });
}

function makeDisposableFunction(fn: () => void): DisposableFunction {
    const disposableFn = fn as DisposableFunction;
    disposableFn[Symbol.dispose] = fn;
    disposableFn[Symbol.asyncDispose] = () => (fn(), Promise.resolve());
    return disposableFn;
}

/**
 * Enable or disable performance measurements.
 * @param enable - true to enable, false to disable. Default is true.
 */
export function enablePerformanceMeasurements(enable = true): void {
    globalThisCSpell[symbolCSpell] ??= {};
    globalThisCSpell[symbolCSpell].enablePerformanceMeasurements = enable;
}

export function isEnabledPerformanceMeasurements(): boolean {
    return !!globalThisCSpell[symbolCSpell]?.enablePerformanceMeasurements;
}
