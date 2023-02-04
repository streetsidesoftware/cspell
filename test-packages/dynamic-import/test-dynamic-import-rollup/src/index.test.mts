import { describe, expect, test } from 'vitest';

import { getPipes } from './index.mjs';

describe('index', () => {
    test('getPipes', async () => {
        const pVitest = getPipes();
        await expect(pVitest).resolves.toBeDefined();
    });
});
