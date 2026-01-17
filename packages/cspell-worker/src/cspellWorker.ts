import type { MessagePort } from 'node:worker_threads';
import { MessageChannel, Worker } from 'node:worker_threads';

import type { CSpellRPCClient } from 'cspell-lib/cspell-rpc';
import { createCSpellRPCClient } from 'cspell-lib/cspell-rpc';

export function startCSpellWorker(): CSpellWorker {
    const messageChannel = new MessageChannel();
    const { port1, port2 } = messageChannel;

    const worker = new Worker(new URL('worker.js', import.meta.url), {
        workerData: { port: port1 },
        transferList: [port1],
        stderr: true,
        stdout: true,
    });

    return new CSpellWorkerImpl({ worker, port: port2 });
}

export interface CSpellWorker {
    ready: Promise<boolean>;
    isReadyNow: boolean;
    numberOfPendingRequests: number;
    ok: (timeoutMs?: number) => Promise<boolean>;
    api: CSpellRPCClient['getApi'];
    client: CSpellRPCClient;
    [Symbol.asyncDispose](): Promise<void>;
}

interface CSpellWorkerInstance {
    worker: Worker;
    port: MessagePort;
}

class CSpellWorkerImpl implements CSpellWorker {
    #terminated: boolean = false;
    #worker: Worker;
    #client: CSpellRPCClient;

    constructor(instance: CSpellWorkerInstance) {
        this.#worker = instance.worker;
        this.#client = createCSpellRPCClient(instance.port);
    }

    get ready(): Promise<boolean> {
        return this.#client.ready();
    }

    get isReadyNow(): boolean {
        return this.#client.isReady;
    }

    get numberOfPendingRequests(): number {
        return this.#client.length;
    }

    get client(): CSpellRPCClient {
        return this.#client;
    }

    get isTerminated(): boolean {
        return this.#terminated;
    }

    ok(timeoutMs?: number): Promise<boolean> {
        return this.#client.isOK({ timeoutMs });
    }

    terminate(): Promise<void> {
        return this[Symbol.asyncDispose]();
    }

    api(): ReturnType<CSpellRPCClient['getApi']> {
        return this.#client.getApi();
    }

    async [Symbol.asyncDispose](): Promise<void> {
        if (this.#terminated) return;
        this.#terminated = true;
        this.#client[Symbol.dispose]();
        await this.#worker.terminate();
        return;
    }
}
