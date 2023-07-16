import { promisify } from 'util';
import { describe, expect, test } from 'vitest';

import { createPerfTimer, getGlobalPerfTimer, measure, measureAsync, startTimer } from './timer.js';

const delay = promisify(setTimeout);

describe('timer', () => {
    test('createTimer', async () => {
        const t = startTimer();
        await delay(12);
        expect(t()).toBeGreaterThan(10);
    });

    test('polyHrTime', async () => {
        const a = startTimer();
        const b = startTimer();
        await delay(12);
        const a1 = a();
        const b1 = b();
        expect(a1).toBeGreaterThanOrEqual(10);
        expect(b1).toBeGreaterThanOrEqual(10);

        expect(Math.abs(b1 - a1)).toBeLessThan(10);
    });

    test('measure', () => {
        let msg = '';
        const r = measure(
            'test',
            () => fib(8),
            (log: string) => (msg = log),
        );
        expect(r).toBe(34);
        expect(msg).toContain('test ');
    });

    test('measureAsync', async () => {
        let msg = '';
        const r = await measureAsync(
            'test',
            async () => fib(8),
            (log: string) => (msg = log),
        );
        expect(r).toBe(34);
        expect(msg).toContain('test ');
    });
});

describe('perfTimer', () => {
    test('createPerfTimer', () => {
        const t = createPerfTimer();
        t.start();
        const x = t.start('x');
        x();
        t.start('y');
        t.stop('y');
        t.mark('mark');
        t.stop();
        const report = t.formatReport();
        expect(report).toContain('start');
        expect(report).toContain('stop');
        expect(report).toContain('mark');
        expect(report).toContain('x');
        expect(report).toContain('y');
    });

    test('getGlobalPerfTimer', () => {
        const t = getGlobalPerfTimer();
        expect(t).toBeDefined();
    });
});

function fib(n: number): number {
    let a = 1,
        b = 0;
    for (let i = 0; i < n; ++i) {
        const c = a + b;
        b = a;
        a = c;
    }
    return a;
}
