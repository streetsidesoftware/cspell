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
    ok: (timeout?: number) => Promise<boolean>;
    client: CSpellRPCClient;
    status: Map<string, number>;
    [Symbol.asyncDispose](): Promise<void>;
}

interface CSpellWorkerInstance {
    worker: Worker;
    port: MessagePort;
}

class CSpellWorkerImpl implements CSpellWorker {
    #terminated: boolean = false;
    #worker: Worker;
    #ready: Promise<boolean>;
    #client: CSpellRPCClient;
    #handleMessage: (message: unknown) => void;
    #listeners: Set<(message: unknown) => boolean> = new Set();
    #status: Map<string, number> = new Map();

    constructor(instance: CSpellWorkerInstance) {
        this.#handleMessage = (message: unknown) => this.#processMessage(message);
        this.#ready = this.#waitForReady();
        this.#worker = instance.worker;
        this.#worker.on('message', this.#handleMessage);
        this.#client = createCSpellRPCClient(instance.port);
        this.#worker.once('exit', () => this.terminate());
    }

    ok(timeout?: number): Promise<boolean> {
        const p = new Promise<boolean>((resolve) => {
            let done = false;
            setTimeout(() => {
                if (done) return;
                done = true;
                resolve(false);
            }, timeout);
            this.#listeners.add((message: unknown) => {
                if (done) return true;
                if (message === 'status:ok') {
                    done = true;
                    resolve(true);
                }
                return done;
            });
        });
        this.#worker.postMessage('status:ok');
        return p;
    }

    get ready(): Promise<boolean> {
        return this.#ready;
    }

    get client(): CSpellRPCClient {
        return this.#client;
    }

    get status(): Map<string, number> {
        return new Map(this.#status);
    }

    get isTerminated(): boolean {
        return this.#terminated;
    }

    #waitForReady(): Promise<boolean> {
        return new Promise((resolve) => {
            const listener = (message: unknown): boolean => {
                if (message === 'status:ready') {
                    resolve(true);
                    return true;
                }
                return false;
            };
            this.#listeners.add(listener);
        });
    }

    #processMessage = (message: unknown): void => {
        if (typeof message === 'string') {
            this.#status.set(message, performance.now());
        }
        for (const listener of this.#listeners) {
            const removeListener = listener(message);
            if (removeListener) {
                this.#listeners.delete(listener);
            }
        }
    };

    terminate(): Promise<void> {
        return this[Symbol.asyncDispose]();
    }

    async [Symbol.asyncDispose](): Promise<void> {
        if (this.#terminated) return;
        this.#terminated = true;
        this.#client[Symbol.dispose]();
        await this.#worker.terminate();
        return;
    }
}
