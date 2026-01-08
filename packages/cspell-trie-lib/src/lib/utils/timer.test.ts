import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

import { startTimer } from './timer.ts';

const delay = promisify(setTimeout);

describe('timer', () => {
    test('createTimer', async () => {
        const t = startTimer();
        await delay(12);
        expect(t()).toBeGreaterThan(10);
    });
});
