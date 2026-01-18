import { MessageChannel } from 'node:worker_threads';

import { CSpellWorkerPool } from '@cspell/cspell-worker';
import { spellCheckDocument, spellCheckDocumentRPC } from 'cspell-lib';
import type { CSpellRPCApi } from 'cspell-lib/cspell-rpc';
import { createCSpellRPCClient, createCSpellRPCServer } from 'cspell-lib/cspell-rpc';

export interface CSpellAPI extends Pick<CSpellRPCApi, 'spellCheckDocument'> {}

const useRPC = false;
const usePool = false;

const apiOrig = {
    spellCheckDocument,
} as const;

const apiRPCNoChannel: CSpellAPI = {
    spellCheckDocument: spellCheckDocumentRPC,
} as const;

const apiOverChannel = createAPIOverChannel();

let pool: CSpellWorkerPool | undefined;

let workerUsed = 0;
let requests = 0;

export function getCSpellAPI(): Promise<CSpellAPI> {
    if (useRPC) {
        return Promise.resolve(apiOverChannel);
    }
    if (usePool) {
        pool ??= new CSpellWorkerPool({
            minWorkers: 1,
        });
        if (!requests) {
            process.stdout.write(`CSpell Worker Pool started with ${pool.size} workers. ${pool.maxWorkers} \r\n`);
        }

        ++requests;

        let api = apiRPCNoChannel;
        const worker = pool.getAvailableWorker();
        if (worker?.isReadyNow) {
            ++workerUsed;
            api = worker.api();
        }
        process.stdout.write(
            `${requests.toString().padStart(5)}: used: ${workerUsed.toString().padStart(5)} workers: ${pool.size}\r\n`,
        );
        return Promise.resolve(api);
    }

    return Promise.resolve(apiOrig);
}

function createAPIOverChannel() {
    const { port1, port2 } = new MessageChannel();
    createCSpellRPCServer(port1);
    const client = createCSpellRPCClient(port2);
    return client.getApi();
}
