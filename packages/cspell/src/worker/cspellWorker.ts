import { Worker } from 'node:worker_threads';

import { RPCClient } from '../rpc/index.js';
import type { CSpellWorkerAPI } from './api.js';

export class CSpellWorker {
    #client: RPCClient<CSpellWorkerAPI>;
    #worker: Worker;
    #messageChannel: MessageChannel;

    constructor() {
        const urlSelf = new URL(import.meta.url);
        const extension = urlSelf.pathname.endsWith('.ts') ? '.ts' : '.js';
        const workerFile = './cspellWorkerThread' + extension;
        const urlWorker = new URL(import.meta.resolve(workerFile));
        this.#messageChannel = new MessageChannel();
        this.#worker = new Worker(urlWorker, {});
        this.#client = new RPCClient<CSpellWorkerAPI>(worker);
    }

    get api(): CSpellWorkerAPI {
        return this.#client.getApi(['spellCheckDocument']);
    }
}
