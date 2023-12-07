import { describe, expect, test } from 'vitest';

import { perf, PerfMonitor } from './perf.js';

describe('PerfMonitor', () => {
    test('perf', () => {
        expect(perf).toBeInstanceOf(PerfMonitor);
        expect(perf.enabled).toBe(false);
    });

    test('should enable and disable performance monitoring', () => {
        const perf = new PerfMonitor();

        expect(perf.enabled).toBe(false);

        perf.enabled = true;
        expect(perf.enabled).toBe(true);

        perf.enabled = false;
        expect(perf.enabled).toBe(false);
    });

    test('should mark and measure performance', () => {
        perf.enabled = true;

        const markStart = perf.mark('start');
        expect(markStart.name).toBe('start');
        // Perform some operations...

        const markEnd = perf.mark('end');
        expect(markEnd.name).toBe('end');

        expect(markEnd.startTime).toBeGreaterThan(markStart.startTime);
    });
});
