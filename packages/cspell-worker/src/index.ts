import { MessageChannel, Worker } from 'node:worker_threads';

import type { CSpellRPCClient } from 'cspell-lib';
import { createCSpellRPCClient } from 'cspell-lib';

import type { SimpleRPCClient } from './simpleServer.js';
import { startSimpleRPCClient } from './simpleServer.js';

export interface CSpellWorkerInstance {
    worker: Worker;
    client: CSpellRPCClient;
}

export function startCSpellWorker(): CSpellWorkerInstance {
    const messageChannel = new MessageChannel();
    const { port1, port2 } = messageChannel;

    const worker = new Worker(new URL('worker.js', import.meta.url), {
        workerData: { port: port1 },
        transferList: [port1],
        stderr: true,
        stdout: true,
    });

    const client = createCSpellRPCClient(port2);

    return { worker, client };
}

export interface SimpleWorkerInstance {
    worker: Worker;
    client: SimpleRPCClient;
}

export function startSimpleRPCWorker(): SimpleWorkerInstance {
    const messageChannel = new MessageChannel();
    const { port1, port2 } = messageChannel;

    const worker = new Worker(new URL('simpleWorker.js', import.meta.url), {
        workerData: { port: port1 },
        transferList: [port1],
        stderr: true,
        stdout: true,
    });

    const client = startSimpleRPCClient(port2);

    return { worker, client };
}
