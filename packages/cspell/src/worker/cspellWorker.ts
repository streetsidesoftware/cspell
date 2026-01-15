import { Buffer } from 'node:buffer';
import { MessageChannel, Worker } from 'node:worker_threads';

import { type CSpellRPCApi, CSpellRPCClient } from 'cspell-lib';

export type { CSpellRPCApi as CSpellWorkerAPI } from 'cspell-lib';

const workerCode = /* JavaScript */ `
import { parentPort } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib';

if (parentPort) {
    createCSpellRPCServer(parentPort);
}
`;

export class CSpellWorker {
    #client: CSpellRPCClient;
    #worker: Worker;
    #messageChannel: MessageChannel;
    #isTerminated: boolean = false;

    constructor() {
        this.#isTerminated = false;
        const base64 = Buffer.from(workerCode).toString('base64');
        this.#messageChannel = new MessageChannel();
        const { port1, port2 } = this.#messageChannel;

        const worker = new Worker(new URL(`data:text/javascript;base64,${base64}`), {
            workerData: { port: port1 },
            transferList: [port1],
        });
        this.#worker = worker;
        this.#client = new CSpellRPCClient(port2);

        this.#worker.once('exit', () => this.terminate());
    }

    get api(): CSpellRPCApi {
        return this.#client.getApi();
    }

    terminate(): Promise<void> {
        return this.#terminate();
    }

    /**
     * This not NOT async on purpose to ensure that #isTerminated is set immediately.
     * @returns Promise<void> that resolves when the worker has exited.
     */
    #terminate(): Promise<void> {
        try {
            if (this.#isTerminated) return Promise.resolve();
            this.#isTerminated = true;
            this.#client[Symbol.dispose]();
            this.#messageChannel.port2.close();
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
