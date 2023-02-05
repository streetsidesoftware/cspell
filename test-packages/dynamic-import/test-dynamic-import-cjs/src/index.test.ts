import { describe, expect, test } from 'vitest';

import { getPipes } from './index';

describe('index', () => {
    test('getPipes', async () => {
        await expect(getPipes()).resolves.toBeDefined();
    });
});
