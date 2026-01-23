import { describe, expect, test } from 'vitest';

import { AlreadyDisposedError } from './errors.js';
import { NotifyEmitter, notifyEventOnce, notifyEventToPromise } from './notify.js';

describe('notify', () => {
    test('NotifyEmitter', () => {
        using emitter = new NotifyEmitter<string>();

        const calls: string[] = [];
        const disposable = emitter.onEvent((value) => {
            calls.push(value);
        });

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        disposable[Symbol.dispose]();

        emitter.notify('third');
        expect(calls).toEqual(['first', 'second']);
    });

    test('Try to add handler after dispose.', () => {
        using emitter = new NotifyEmitter<string>();

        const calls: string[] = [];
        using _disposable = emitter.onEvent(recordCalls);
        expect(emitter.size).toBe(1);
        emitter[Symbol.dispose]();
        expect(emitter.size).toBe(0);

        expect(() => emitter.onEvent(() => {})).toThrowError(AlreadyDisposedError);

        function recordCalls(value: string) {
            calls.push(value);
        }
    });

    test('multiple adds and dispose', () => {
        using emitter = new NotifyEmitter<string>();

        const calls: string[] = [];
        using d0 = emitter.onEvent(recordCalls);
        using d1 = emitter.onEvent(recordCalls);
        expect(emitter.size).toBe(1);
        expect(d1).toBe(d0);

        emitter.notify('first');

        expect(calls).toEqual(['first']);

        d0[Symbol.dispose]();
        expect(emitter.size).toBe(0);

        using d2 = emitter.onEvent(recordCalls);
        expect(emitter.size).toBe(1);
        expect(d2).not.toBe(d0);
        d1[Symbol.dispose]();
        expect(emitter.size).toBe(1);

        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        function recordCalls(value: string) {
            calls.push(value);
        }
    });

    test('emitter.next', async () => {
        using emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);
        const n1 = emitter.awaitNext();
        expect(emitter.size).toBe(1);
        emitter.notify('first');
        emitter.notify('second');
        await expect(n1).resolves.toBe('first');
        expect(emitter.size).toBe(0);
    });

    test('emitter.next timeout', async () => {
        using emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);
        const n1 = emitter.awaitNext(AbortSignal.timeout(10));
        expect(emitter.size).toBe(1);
        await expect(n1).rejects.toThrowError('The operation was aborted due to timeout');
        expect(emitter.size).toBe(0);
    });

    test('notifyEventToPromise', async () => {
        using emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        using _disposable = emitter.onEvent((value) => {
            calls.push(value);
        });
        expect(emitter.size).toBe(1);

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        expect(emitter.size).toBe(1);
        const p = notifyEventToPromise(emitter.onEvent);
        expect(emitter.size).toBe(2);

        emitter.notify('third');
        emitter.notify('fourth');

        expect(calls).toEqual(['first', 'second', 'third', 'fourth']);
        await expect(p).resolves.toBe('third');
        expect(emitter.size).toBe(1);
    });

    test('notifyEventToPromise already aborted', async () => {
        using emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);
        const ctrl = new AbortController();
        const p = notifyEventToPromise(emitter.onEvent, ctrl.signal);
        expect(emitter.size).toBe(1);
        ctrl.abort();
        await expect(p).rejects.toBe(ctrl.signal.reason);
    });

    test('notifyEventToPromise timeout', async () => {
        using emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);
        const signal = AbortSignal.timeout(10);
        const p = notifyEventToPromise(emitter.onEvent, signal);
        expect(emitter.size).toBe(1);
        await expect(p).rejects.toThrowError('The operation was aborted due to timeout');
        expect(emitter.size).toBe(0);

        // try again with an aborted signal
        const p2 = notifyEventToPromise(emitter.onEvent, signal);
        expect(emitter.size).toBe(0); // It was never registered.
        await expect(p2).rejects.toThrowError('The operation was aborted due to timeout');
    });

    test('notifyEventOnce', async () => {
        using emitter = new NotifyEmitter<string>();
        const once = notifyEventOnce(emitter.onEvent);
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        const addToCalls = (value: string) => calls.push(value);
        using _disposable = emitter.onEvent(addToCalls);
        expect(emitter.size).toBe(1);

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        expect(emitter.size).toBe(1);
        using _once1 = once(addToCalls);
        using _once2 = once(addToCalls);
        using _once3 = once(addToCalls);
        expect(emitter.size).toBe(4);

        emitter.notify('third');
        emitter.notify('fourth');

        expect(calls).toEqual(['first', 'second', 'third', 'third', 'third', 'third', 'fourth']);
        expect(emitter.size).toBe(1);
    });

    test('NotifyEmitter.once', async () => {
        const emitter = new NotifyEmitter<string>();
        const once = emitter.once;
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        const addToCalls = (value: string) => calls.push(value);
        using _disposable = emitter.onEvent(addToCalls);
        expect(emitter.size).toBe(1);

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        expect(emitter.size).toBe(1);
        using _once1 = once(addToCalls);
        using _once2 = once(addToCalls);
        using _once3 = once(addToCalls);
        expect(emitter.size).toBe(4);

        emitter.notify('third');
        emitter.notify('fourth');

        expect(calls).toEqual(['first', 'second', 'third', 'third', 'third', 'third', 'fourth']);
        expect(emitter.size).toBe(1);
    });
});
