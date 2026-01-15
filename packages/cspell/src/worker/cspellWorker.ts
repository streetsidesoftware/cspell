import type { Worker } from 'node:worker_threads';

import { startCSpellWorker } from '@cspell/cspell-worker';
import type { CSpellRPCApi, CSpellRPCClient } from 'cspell-lib';

export type { CSpellRPCApi as CSpellWorkerAPI } from 'cspell-lib';

export class CSpellWorker {
    #client: CSpellRPCClient;
    #worker: Worker;
    #isTerminated: boolean = false;
    #online: Promise<void>;

    constructor() {
        this.#isTerminated = false;
        const { client, worker } = startCSpellWorker();

        worker.on('error', (err) => {
            console.error('CSpell Worker error: %o', err);
        });
        worker.ref();
        this.#worker = worker;
        this.#client = client;

        this.#online = new Promise((resolve) => {
            console.log('Waiting for CSpell Worker to come online...');
            this.#worker.once('online', (event: unknown) => {
                console.log('CSpell Worker is online. %o', event);
                resolve();
            });
        });

        this.#worker.once('exit', this.#handleOnExit);
    }

    get api(): CSpellRPCApi {
        return this.#client.getApi();
    }

    get online(): Promise<void> {
        return this.#online;
    }

    getClient(): CSpellRPCClient {
        return this.#client;
    }

    terminate(): Promise<void> {
        return this.#terminate();
    }

    #handleOnExit = () => {
        console.log('CSpell Worker exited.');
        this.#terminate();
    };

    /**
     * This not async on purpose to ensure that #isTerminated is set immediately.
     * @returns Promise<void> that resolves when the worker has exited.
     */
    #terminate(): Promise<void> {
        try {
            if (this.#isTerminated) return Promise.resolve();
            this.#worker.unref();
            this.#isTerminated = true;
            this.#client[Symbol.dispose]();
            return this.#worker
                .terminate()
                .then(() => {})
                .catch(() => {});
        } catch {
            // Ignore errors on terminate
            return Promise.resolve();
        }
    }

    [Symbol.asyncDispose](): Promise<void> {
        return this.terminate();
    }
}
