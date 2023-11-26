import { describe, expect, test, vi } from 'vitest';

import * as clearCachedFiles from './clearCachedFiles.js';
import { onClearCache } from './events/events.js';

describe('clearCachedFiles', () => {
    test('clearCachedFiles', async () => {
        await expect(clearCachedFiles.clearCachedFiles()).resolves.not.toThrow();
    });

    test('clearCaches', () => {
        const listener = vi.fn();
        const dispose = onClearCache(listener);
        expect(() => clearCachedFiles.clearCaches()).not.toThrow();
        expect(listener).toHaveBeenCalledTimes(1);
        dispose.dispose();
        listener.mockClear();
        expect(() => clearCachedFiles.clearCaches()).not.toThrow();
        expect(listener).not.toHaveBeenCalled();
    });
});
