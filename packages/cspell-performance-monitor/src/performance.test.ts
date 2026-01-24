import { describe, expect, test } from 'vitest';

import {
    enablePerformanceMeasurements,
    isEnabledPerformanceMeasurements,
    measurePerf,
    measurePerfEnd,
    measurePerfStart,
} from './performance.ts';

describe('performance enabled.', () => {
    test('isEnabledPerformanceMeasurements', () => {
        enablePerformanceMeasurements();
        expect(isEnabledPerformanceMeasurements()).toBe(true);
    });

    test('measurePerf simple', () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';
        const stop = measurePerf(name);
        stop();

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(0);
    });

    test('measurePerf simple using', () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';

        function work() {
            using _ = measurePerf(name);
            return;
        }

        work();

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(0);
    });

    test('measurePerf simple using scope', () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';

        {
            using _ = measurePerf(name);
        }

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(0);
    });

    test('measurePerf async', async () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';
        async function work() {
            using _ = measurePerf(name);
            await wait(50);
            return;
        }

        await work();

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(45); // Note: 45 is to allow for some timing slop
    });

    test('measurePerf await using', async () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';
        async function work() {
            await using _ = measurePerf(name);
            return await wait(50);
        }

        await work();

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(45); // Note: 45 is to allow for some timing slop
    });

    test('measurePerfStart', () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';
        measurePerfStart(name);
        const marks = performance.getEntriesByName(name + '-start', 'mark');
        expect(marks.length).toBe(1);
    });

    test('measurePerfEnd', () => {
        enablePerformanceMeasurements();
        const name = expect.getState().currentTestName || 'test';
        measurePerfStart(name);
        measurePerfEnd(name);
        const marks = performance.getEntriesByName(name + '-end', 'mark');
        expect(marks.length).toBe(1);
        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(1);
        const measure = measures[0];
        expect(measure.duration).toBeGreaterThanOrEqual(0);
    });
});

describe('performance disabled.', () => {
    test('isEnabledPerformanceMeasurements', () => {
        enablePerformanceMeasurements(false);
        expect(isEnabledPerformanceMeasurements()).toBe(false);
    });

    test('measurePerf simple using scope', () => {
        enablePerformanceMeasurements(false);
        const name = expect.getState().currentTestName || 'test';

        {
            using _ = measurePerf(name);
        }

        const measures = performance.getEntriesByName(name, 'measure');
        expect(measures.length).toBe(0);
    });
});

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
