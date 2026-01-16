import { MessageChannel, Worker } from 'node:worker_threads';

import type { CSpellRPCClient } from 'cspell-lib/cspell-rpc';
import { createCSpellRPCClient } from 'cspell-lib/cspell-rpc';

import type { SimpleRPCClient } from './simpleServer.js';
import { startSimpleRPCClient } from './simpleServer.js';

export interface CSpellWorkerInstance {
    worker: Worker;
    client: CSpellRPCClient;
    ok: (timeout?: number) => Promise<boolean>;
    online: Promise<void>;
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

    const online = workerOnline(worker);
    const client = createCSpellRPCClient(port2);
    const ok = createWorkerOk(worker);

    return { worker, client, ok, online };
}

export interface SimpleWorkerInstance {
    worker: Worker;
    client: SimpleRPCClient;
    ok: (timeout?: number) => Promise<boolean>;
    online: Promise<void>;
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

    const online = workerOnline(worker);
    const client = startSimpleRPCClient(port2);
    const ok = createWorkerOk(worker);

    return { worker, client, ok, online };
}

function createWorkerOk(worker: Worker, defaultTimeout: number = 1000): (timeout?: number) => Promise<boolean> {
    const ok = (timeout: number = defaultTimeout): Promise<boolean> => {
        const promise = new Promise<boolean>((resolve) => {
            let resolved: boolean = false;
            let t: NodeJS.Timeout | undefined = setTimeout(() => r(false), timeout);
            const r = (v: boolean) => {
                if (!resolved) {
                    resolved = true;
                    resolve(v);
                }
                if (t) {
                    clearTimeout(t);
                }
                t = undefined;
            };
            worker.once('message', (message: unknown) => {
                r(message === 'ok');
            });
        });

        worker.postMessage('ok');

        return promise;
    };

    return ok;
}

function workerOnline(worker: Worker): Promise<void> {
    return new Promise((resolve) => {
        worker.once('online', () => resolve());
    });
}
