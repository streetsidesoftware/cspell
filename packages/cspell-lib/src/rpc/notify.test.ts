import { describe, expect, test } from 'vitest';

import { NotifyEmitter, notifyEventOnce, notifyEventToPromise } from './notify.js';

describe('notify', () => {
    test('NotifyEmitter', () => {
        const emitter = new NotifyEmitter<string>();

        const calls: string[] = [];
        const disposable = emitter.event((value) => {
            calls.push(value);
        });

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        disposable[Symbol.dispose]();

        emitter.notify('third');
        expect(calls).toEqual(['first', 'second']);
    });

    test('notifyEventToPromise', async () => {
        const emitter = new NotifyEmitter<string>();
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        using _disposable = emitter.event((value) => {
            calls.push(value);
        });
        expect(emitter.size).toBe(1);

        emitter.notify('first');
        emitter.notify('second');

        expect(calls).toEqual(['first', 'second']);

        expect(emitter.size).toBe(1);
        const p = notifyEventToPromise(emitter.event);
        expect(emitter.size).toBe(2);

        emitter.notify('third');
        emitter.notify('fourth');

        expect(calls).toEqual(['first', 'second', 'third', 'fourth']);
        await expect(p).resolves.toBe('third');
        expect(emitter.size).toBe(1);
    });

    test('notifyEventOnce ', async () => {
        const emitter = new NotifyEmitter<string>();
        const once = notifyEventOnce(emitter.event);
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        const addToCalls = (value: string) => calls.push(value);
        using _disposable = emitter.event(addToCalls);
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

    test('NotifyEmitter.once ', async () => {
        const emitter = new NotifyEmitter<string>();
        const once = emitter.once;
        expect(emitter.size).toBe(0);

        const calls: string[] = [];
        const addToCalls = (value: string) => calls.push(value);
        using _disposable = emitter.event(addToCalls);
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
