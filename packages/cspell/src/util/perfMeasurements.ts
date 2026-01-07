import type { PerformanceMeasure } from 'node:perf_hooks';

export interface PerfMeasurement {
    depth: number;
    name: string;
    totalTimeMs: number;
    nestedTimeMs: number;
    count: number;
    minTimeMs: number;
    maxTimeMs: number;
    children?: Map<string, PerfMeasurement>;
}

interface ParentPerfMeasurement {
    depth: number;
    totalTimeMs: number;
    nestedTimeMs: number;
    children?: Map<string, PerfMeasurement>;
}

export function getPerfMeasurements(): PerfMeasurement[] {
    const measurements = performance.getEntriesByType('measure') as PerformanceMeasure[];
    const childrenMap = new Map<string, PerfMeasurement>();
    const root = {
        depth: -1,
        totalTimeMs: 0,
        nestedTimeMs: 0,
        children: childrenMap,
    } as const satisfies ParentPerfMeasurement;

    if (!measurements.length) return [];

    interface StackItem {
        m: PerformanceMeasure;
        p: PerfMeasurement;
    }

    const stack: StackItem[] = [];
    let depth = 0;
    for (let i = 0; i < measurements.length; i++) {
        const m = measurements[i];
        rollUpStack(m.startTime);
        // console.log(
        //     '%s %s',
        //     stack
        //         .slice(0, depth)
        //         .map((s) => s.p.name)
        //         .join('>') + m.name,
        //     m.duration.toFixed(2),
        // );
        const s: StackItem = { m, p: addToParent(depth === 0 ? root : stack[depth - 1].p, m) };
        stack[depth++] = s;
    }

    sortChildren(root);

    return [...root.children.values()].flatMap((r) => [...flattenChildren(r)]);

    function contains(m: PerformanceMeasure, t: number): boolean {
        const stop = m.startTime + m.duration;
        return m.startTime <= t && t < stop;
    }

    function rollUpStack(t: number) {
        for (; depth > 0 && !contains(stack[depth - 1].m, t); --depth) {
            // empty
        }
    }

    function addToParent(p: ParentPerfMeasurement, m: PerformanceMeasure): PerfMeasurement {
        p.children ??= new Map();
        p.nestedTimeMs += m.duration;
        return updateChild(p.children, m, p.depth + 1);
    }

    function updateChild(
        children: Map<string, PerfMeasurement>,
        m: PerformanceMeasure,
        depth: number,
    ): PerfMeasurement {
        const p = children.get(m.name);
        if (p) {
            p.totalTimeMs += m.duration;
            p.count += 1;
            p.minTimeMs = Math.min(p.minTimeMs, m.duration);
            p.maxTimeMs = Math.max(p.maxTimeMs, m.duration);
            return p;
        }
        const n: PerfMeasurement = {
            name: m.name,
            depth,
            totalTimeMs: m.duration,
            nestedTimeMs: 0,
            count: 1,
            minTimeMs: m.duration,
            maxTimeMs: m.duration,
        };
        children.set(m.name, n);
        return n;
    }

    function* flattenChildren(m: PerfMeasurement): Iterable<PerfMeasurement> {
        yield m;
        if (!m.children) return;
        for (const child of m.children.values()) {
            yield* flattenChildren(child);
        }
    }

    function sortChildren(m: ParentPerfMeasurement): void {
        if (!m.children) return;
        m.children = new Map([...m.children.entries()].sort((a, b) => b[1].totalTimeMs - a[1].totalTimeMs));
        m.children.forEach(sortChildren);
    }
}
