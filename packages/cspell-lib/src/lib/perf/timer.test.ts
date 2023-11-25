import { promisify } from 'util';
import { describe, expect, test, vi } from 'vitest';

import { createPerfTimer } from './timer.js';

const delay = promisify(setTimeout);

describe('timer', () => {
    test('createTimer', async () => {
        const t = createPerfTimer('test');
        await delay(12);
        expect(t.elapsed).toBeGreaterThan(10);
    });

    test('createTimer with onEnd', async () => {
        const onEnd = vi.fn();
        const timer = createPerfTimer('test', onEnd);
        const v0 = timer.elapsed;
        await delay(12);
        const v2 = timer.elapsed;
        expect(v2).toBeGreaterThan(v0);
        timer.end();
        const v3 = timer.elapsed;
        expect(onEnd).toHaveBeenCalledOnce();
        timer.end();
        expect(onEnd).toHaveBeenCalledOnce();
        await delay(12);
        expect(timer.elapsed).toBe(v3);
    });
});
