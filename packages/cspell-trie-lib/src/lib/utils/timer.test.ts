import { promisify } from 'util';

import { createTimer, polyHrTime } from './timer';

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

        expect(Math.abs(b1 - a1)).toBeLessThan(10);
    });
});
