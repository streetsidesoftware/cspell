import { describe, expect, test, vi } from 'vitest';

import { addEventListener, ClearCacheEvent, dispatchClearCache, dispatchEvent, onClearCache } from './events.js';

describe('events', () => {
    describe('addEventListener', () => {
        test('should add an event listener for ClearCacheEvent', () => {
            const listener = vi.fn();
            const disposableListener = addEventListener('clear-cache', listener);

            expect(disposableListener).toBeDefined();

            const event = new ClearCacheEvent();
            dispatchEvent(event);

            expect(listener).toHaveBeenCalledWith(event);
            expect(listener).toHaveBeenCalledTimes(1);

            disposableListener.dispose();

            const event2 = new ClearCacheEvent();
            dispatchEvent(event2);
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('ClearCacheEvent', () => {
        test('should have the correct event name', () => {
            expect(ClearCacheEvent.eventName).toBe('clear-cache');
        });

        test('onClearCache should add an event listener for ClearCacheEvent', () => {
            const listener = vi.fn();

            const disposableListener = onClearCache(listener);

            expect(disposableListener).toBeDefined();

            dispatchClearCache();
            expect(listener).toHaveBeenCalledTimes(1);

            dispatchClearCache();
            expect(listener).toHaveBeenCalledTimes(2);

            disposableListener.dispose();
            dispatchClearCache();
            expect(listener).toHaveBeenCalledTimes(2);
        });
    });
});
