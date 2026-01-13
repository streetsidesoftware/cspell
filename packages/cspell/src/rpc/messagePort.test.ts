import { MessageChannel } from 'node:worker_threads';

import { describe, expect, test } from 'vitest';

import type { MessagePortLike } from './messagePort.js';

describe('MessagePort', () => {
    test('MessagePort Node type check', () => {
        const channel = new MessageChannel();
        const port: MessagePortLike = channel.port1;

        expect(port).toBeDefined();
    });
});
