import { describe, expect, test, vi } from 'vitest';

import { createEmitter, dispatchClearCache, EventEmitter, onClearCache } from './events.js';

describe('events', () => {
    describe('EventEmitter', () => {
        test('should add and remove listeners', () => {
            const emitter = createEmitter<string>('test');
            expect(emitter).toBeInstanceOf(EventEmitter);
            const listener = vi.fn();
            const listener2 = vi.fn();
            const d1 = emitter.on(listener);
            const d2 = emitter.on(listener2);
            emitter.fire('test');
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenLastCalledWith('test');
            expect(listener2).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenLastCalledWith('test');
            const d1a = emitter.on(listener);
            emitter.fire('test2');
            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenLastCalledWith('test2');
            expect(listener2).toHaveBeenCalledTimes(2);
            expect(listener2).toHaveBeenLastCalledWith('test2');
            d1.dispose();
            emitter.fire('test3');
            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenLastCalledWith('test2');
            expect(listener2).toHaveBeenCalledTimes(3);
            expect(listener2).toHaveBeenLastCalledWith('test3');
            d1a.dispose();
            d2.dispose();
            emitter.dispose();
        });

        test('should handle errors in listeners', () => {
            const emitter = createEmitter<string>('test');
            expect(emitter).toBeInstanceOf(EventEmitter);
            const listener = vi.fn();
            const listener2 = vi.fn(() => {
                throw new Error('test error');
            });
            emitter.on(listener);
            emitter.on(listener2);
            let r = emitter.fire('test');
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenLastCalledWith('test');
            expect(listener2).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenLastCalledWith('test');
            expect(r).toHaveLength(1);
            r = emitter.fire('test2');
            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenLastCalledWith('test2');
            expect(listener2).toHaveBeenCalledTimes(2);
            expect(listener2).toHaveBeenLastCalledWith('test2');
            expect(r).toHaveLength(1);
            emitter.dispose();
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
