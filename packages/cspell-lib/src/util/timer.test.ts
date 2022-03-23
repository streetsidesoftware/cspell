import { createLapRecorder, createTimer, polyHrTime } from './timer';
import { promisify } from 'util';

const delay = promisify(setTimeout);

describe('timer', () => {
    test('createTimer', async () => {
        const t = createTimer();
        await delay(12);
        expect(t.elapsed()).toBeGreaterThan(10);
    });

    test('polyHrTime', async () => {
        const a = createTimer();
        const b = createTimer(polyHrTime);
        await delay(12);
        const a1 = a.elapsed();
        const b1 = b.elapsed();
        expect(a1).toBeGreaterThanOrEqual(10);
        expect(b1).toBeGreaterThanOrEqual(10);

        expect(Math.abs(b1 - a1)).toBeLessThan(2);
    });

    test('lap', async () => {
        const t = createTimer();
        const a = t.lap();
        await delay(12);
        const b = t.lap();
        await delay(1);
        expect(b).toBeLessThan(t.elapsed());
        expect(a).toBeLessThan(b);
    });
});

describe('LapRecorder', () => {
    test('LapRecorder', () => {
        const timer = createLapRecorder();
        timer.lap('a');
        timer.lap('b');
        expect(timer.times.length).toBe(2);
        expect(timer.times[0][0]).toBe('a');
        expect(timer.times[0][1]).toBe(timer.times[0][2]);
        expect(timer.report()).toHaveLength(2);
    });
});
