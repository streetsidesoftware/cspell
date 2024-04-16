import { describe, expect, test, vi } from 'vitest';

import { createEmitter, dispatchClearCache, EventEmitter, onClearCache } from './events.js';

describe('events', () => {
    describe('EventEmitter', () => {
        test('should add and remove listeners', () => {
            const emitter = createEmitter<string>('test');
            expect(emitter).toBeInstanceOf(EventEmitter);
            const listener = vi.fn();
            const d1 = emitter.on(listener);
            emitter.fire('test');
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenLastCalledWith('test');
            const d2 = emitter.on(listener);
            emitter.fire('test2');
            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenLastCalledWith('test2');
            d1.dispose();
            emitter.fire('test3');
            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenLastCalledWith('test2');
            d2.dispose();
        });
    });

    describe('onClearCache', () => {
        test('should add an event listener for ClearCacheEvent', () => {
            const listener = vi.fn();
            const disposableListener = onClearCache(listener);

            expect(disposableListener).toBeDefined();

            dispatchClearCache();

            expect(listener).toHaveBeenCalledTimes(1);

            disposableListener.dispose();

            dispatchClearCache();
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });
});
