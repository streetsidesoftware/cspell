import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test } from 'vitest';

import { AlreadyDisposedError } from './errors.js';
import { MessagePortNotifyEvents } from './MessagePortEvents.js';

describe('MessagePortEvents', () => {
    test('new MessagePortNotifyEvents', () => {
        const channel = new MessageChannel();
        const { port1 } = channel;

        using msgEventsA = new MessagePortNotifyEvents(port1);

        expect(msgEventsA).toBeDefined();
    });

    test('MessagePortNotifyEvents double dispose', () => {
        const channel = new MessageChannel();
        const { port1 } = channel;

        using msgEvents = new MessagePortNotifyEvents(port1);

        expect(msgEvents).toBeDefined();

        msgEvents[Symbol.dispose]();
        msgEvents[Symbol.dispose]();

        expect(() => msgEvents.onMessage(() => {})).toThrowError(AlreadyDisposedError);
    });

    test('onMessage', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const calls: unknown[] = [];
        const timeout = abortTimeout(1000);

        using msgEvents = new MessagePortNotifyEvents(port1);
        using _dMsg = msgEvents.onMessage(recordCalls(calls));

        msgEvents.start();

        port2.postMessage('test1');
        port2.postMessage('test2');

        await expect(msgEvents.awaitNextMessage(timeout)).resolves.toBe('test1');
        await expect(msgEvents.awaitNextMessage(timeout)).resolves.toBe('test2');

        expect(calls).toEqual(['test1', 'test2']);
    });

    test('onClose', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const calls: unknown[] = [];
        const timeout = abortTimeout(100);

        using msgEvents1 = new MessagePortNotifyEvents(port1);
        using msgEvents2 = new MessagePortNotifyEvents(port2);
        using _dMsg = msgEvents1.onClose(recordCalls(calls));
        const pClose1 = msgEvents1.awaitClose(timeout);
        const pClose2 = msgEvents2.awaitClose(timeout);
        port1.close();
        await expect(pClose1).resolves.toBeInstanceOf(Event);
        // Because port1 was closed, port2 should also get the close event.
        await expect(pClose2).resolves.toBeInstanceOf(Event);
        expect(calls).toEqual([expect.any(Event)]);
    });

    test('onClose reverse', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const calls: unknown[] = [];
        const timeout = abortTimeout(100);

        using msgEvents1 = new MessagePortNotifyEvents(port1);
        using msgEvents2 = new MessagePortNotifyEvents(port2);
        using _dMsg = msgEvents1.onClose(recordCalls(calls));
        const pClose1 = msgEvents1.awaitClose(timeout);
        const pClose2 = msgEvents2.awaitClose(timeout);
        msgEvents2.close();
        await expect(pClose2).resolves.toBeInstanceOf(Event);
        // Because port2 was closed, port1 should also get the close event.
        await expect(pClose1).resolves.toBeInstanceOf(Event);
        expect(calls).toEqual([expect.any(Event)]);
    });

    test('onMessageError', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const messages1: unknown[] = [];
        const messages2: unknown[] = [];

        const errors1: unknown[] = [];
        const errors2: unknown[] = [];
        const timeout = abortTimeout(100);

        using msgEvents1 = new MessagePortNotifyEvents(port1);
        using msgEvents2 = new MessagePortNotifyEvents(port2);

        using _dMsg1 = msgEvents1.onMessage(recordCalls(messages1));
        using _dMsg2 = msgEvents2.onMessage(recordCalls(messages2));

        using _dErr1 = msgEvents1.onMessageError(recordCalls(errors1));
        using _dErr2 = msgEvents2.onMessageError(recordCalls(errors2));

        // Let send an error from port2 to port1
        port2.postMessage(new Error('Test error'));
        await wait(50);
        port1.close();
        port1.postMessage('After Close');
        await expect(msgEvents1.awaitClose(timeout)).resolves.toBeInstanceOf(Event);
        await expect(msgEvents2.awaitClose(timeout)).resolves.toBeInstanceOf(Event);

        expect(messages1).toEqual([new Error('Test error')]);
        expect(messages2).toEqual([]);
        // We do not expect any message errors.
        expect(errors1.length).toBe(0);
        expect(errors2.length).toBe(0);
    });
});

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function recordCalls<T>(target: T[]) {
    return (value: T) => target.push(value);
}

function abortTimeout(ms: number): AbortSignal {
    return AbortSignal.timeout(ms);
}
