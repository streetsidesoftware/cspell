import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test, vi } from 'vitest';

import type { MessagePortLike } from './messagePort.js';
import { RPCServer } from './server.js';

describe('RPC Server', () => {
    test('new RPCServer', () => {
        const channel = new MessageChannel();
        const port = channel.port1;
        spyOnPort(port);

        const api = {
            add: (a: number, b: number): number => a + b,
            sub: (a: number, b: number): number => a - b,
            mul: (a: number, b: number): number => a * b,
            div: (a: number, b: number): number => a / b,
        };

        const server = new RPCServer(port, api);
        expect(server).toBeDefined();
        expect(port.addListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(port.start).toHaveBeenCalled();
        server[Symbol.dispose]();
        expect(port.close).toHaveBeenCalled();
    });
});

function spyOnPort(port: MessagePortLike) {
    const spyOnAddListener = vi.spyOn(port, 'addListener');
    const spyOnStart = vi.spyOn(port, 'start');
    const spyOnClose = vi.spyOn(port, 'close');
    return { spyOnAddListener, spyOnStart, spyOnClose };
}
