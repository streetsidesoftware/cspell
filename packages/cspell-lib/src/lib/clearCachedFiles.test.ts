import { describe, expect, test } from 'vitest';

import * as clearCachedFiles from './clearCachedFiles.js';

describe('clearCachedFiles', () => {
    test('clearCachedFiles', async () => {
        await expect(clearCachedFiles.clearCachedFiles()).resolves.not.toThrow();
    });
});
