import type { PerformanceMeasure } from 'node:perf_hooks';

export interface PerfMeasurement {
    key: string;
    depth: number;
    name: string;
    totalTimeMs: number;
    nestedTimeMs: number;
    count: number;
    minTimeMs: number;
    maxTimeMs: number;
}

export function getPerfMeasurements(): PerfMeasurement[] {
    const measurements = performance.getEntriesByType('measure') as PerformanceMeasure[];
    const measurementMap: Map<string, PerfMeasurement> = new Map();

    if (!measurements.length) return [];

    interface StackItem {
        k: string;
        m: PerformanceMeasure;
        p: PerfMeasurement;
    }

    const stack: StackItem[] = [];
    let depth = 0;
    for (let i = 0; i < measurements.length; i++) {
        const m = measurements[i];
        rollUpStack(m.startTime);
        const k = (stack[depth - 1]?.k || '') + '>' + m.name;
        const s: StackItem = { k, m, p: addMeasurement(k, m, depth) };
        if (depth > 0) {
            const parent = stack[depth - 1];
            parent.p.nestedTimeMs += m.duration;
        }
        stack[depth++] = s;
    }

    return [...measurementMap.values()];

    function contains(m: PerformanceMeasure, t: number): boolean {
        const stop = m.startTime + m.duration;
        return m.startTime <= t && t < stop;
    }

    function rollUpStack(t: number) {
        for (; depth > 0 && !contains(stack[depth - 1].m, t); --depth) {
            // empty
        }
    }

    function addMeasurement(k: string, m: PerformanceMeasure, depth: number): PerfMeasurement {
        const p = getByKey(k, m.name, depth);
        const timeMs = m.duration;
        p.totalTimeMs += timeMs;
        p.count += 1;
        p.minTimeMs = Math.min(p.minTimeMs, timeMs);
        p.maxTimeMs = Math.max(p.maxTimeMs, timeMs);
        return p;
    }

    function getByKey(k: string, name: string, depth: number): PerfMeasurement {
        const m = measurementMap.get(k);
        if (m) return m;
        const p: PerfMeasurement = {
            key: k,
            name,
            depth,
            totalTimeMs: 0,
            nestedTimeMs: 0,
            count: 0,
            minTimeMs: Number.MAX_SAFE_INTEGER,
            maxTimeMs: 0,
        };
        measurementMap.set(k, p);
        return p;
    }
}
