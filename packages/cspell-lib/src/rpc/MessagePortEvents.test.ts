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
        using _dMsg = msgEvents.onMessage(recordCalls);

        port2.postMessage('test1');
        port2.postMessage('test2');

        await expect(msgEvents.awaitNextMessage(timeout)).resolves.toBe('test1');
        await expect(msgEvents.awaitNextMessage(timeout)).resolves.toBe('test2');

        expect(calls).toEqual(['test1', 'test2']);

        function recordCalls(value: unknown) {
            calls.push(value);
        }
    });

    test('onClose', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const calls: unknown[] = [];
        const timeout = abortTimeout(100);

        using msgEvents1 = new MessagePortNotifyEvents(port1);
        using msgEvents2 = new MessagePortNotifyEvents(port2);
        using _dMsg = msgEvents1.onClose(recordCalls);
        const pClose1 = msgEvents1.awaitClose(timeout);
        const pClose2 = msgEvents2.awaitClose(timeout);
        port1.close();
        await expect(pClose1).resolves.toBeInstanceOf(Event);
        // Because port1 was closed, port2 should also get the close event.
        await expect(pClose2).resolves.toBeInstanceOf(Event);
        expect(calls).toEqual([expect.any(Event)]);

        function recordCalls(value: unknown) {
            calls.push(value);
        }
    });

    test('onClose', async () => {
        const channel = new MessageChannel();
        const { port1, port2 } = channel;

        const calls: unknown[] = [];
        const timeout = abortTimeout(100);

        using msgEvents1 = new MessagePortNotifyEvents(port1);
        using msgEvents2 = new MessagePortNotifyEvents(port2);
        using _dMsg = msgEvents1.onClose(recordCalls);
        const pClose1 = msgEvents1.awaitClose(timeout);
        const pClose2 = msgEvents2.awaitClose(timeout);
        port1.close();
        await expect(pClose1).resolves.toBeInstanceOf(Event);
        // Because port1 was closed, port2 should also get the close event.
        await expect(pClose2).resolves.toBeInstanceOf(Event);
        expect(calls).toEqual([expect.any(Event)]);

        function recordCalls(value: unknown) {
            calls.push(value);
        }
    });
});

function abortTimeout(ms: number): AbortSignal {
    return AbortSignal.timeout(ms);
}
