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

        using msgEvents = new MessagePortNotifyEvents(port1);
        using _dMsg = msgEvents.onMessage(recordCalls);

        port2.postMessage('test1');
        port2.postMessage('test2');

        await expect(msgEvents.nextMessage(AbortSignal.timeout(1000))).resolves.toBe('test1');
        await expect(msgEvents.nextMessage(AbortSignal.timeout(1000))).resolves.toBe('test2');

        expect(calls).toEqual(['test1', 'test2']);

        function recordCalls(value: unknown) {
            calls.push(value);
        }
    });
});
