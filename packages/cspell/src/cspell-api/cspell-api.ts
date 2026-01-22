import { MessageChannel } from 'node:worker_threads';

import { CSpellWorkerPool } from '@cspell/cspell-worker';
import { spellCheckDocument, spellCheckDocumentRPC } from 'cspell-lib';
import type { CSpellRPCApi, CSpellRPCClient } from 'cspell-lib/cspell-rpc';
import { createCSpellRPCClient, createCSpellRPCServer } from 'cspell-lib/cspell-rpc';

export interface CSpellAPI extends Pick<CSpellRPCApi, 'spellCheckDocument'> {}

const useRPC = false;
const usePool = false;

const MIN_NUM_WORKERS = 6;
const JOBS_PER_CORE = 16;

const apiOrig = {
    spellCheckDocument,
} as const;

const apiRPCNoChannel: CSpellAPI = {
    spellCheckDocument: spellCheckDocumentRPC,
} as const;

let pool: CSpellWorkerPool | undefined;

let workerUsed = 0;
let requests = 0;

export function getCSpellAPI(): Promise<CSpellAPI> {
    if (useRPC) {
        return Promise.resolve(getAPIOverChannel());
    }
    if (usePool) {
        pool ??= new CSpellWorkerPool({
            minWorkers: MIN_NUM_WORKERS,
            maxPendingTasksPerWorker: JOBS_PER_CORE,
        });
        // if (!requests) {
        //     process.stdout.write(`CSpell Worker Pool started with ${pool.size} workers. ${pool.maxWorkers} \r\n`);
        // }

        ++requests;

        let api = apiRPCNoChannel;
        const worker = pool.getAvailableWorker({ autostart: true });
        if (worker?.isReadyNow) {
            ++workerUsed;
            api = worker.api();
        }
        // process.stdout.write(
        //     `${requests.toString().padStart(5)}: used: ${workerUsed.toString().padStart(5)} workers: ${pool.size}\r\n`,
        // );
        return Promise.resolve(api);
    }

    return Promise.resolve(apiOrig);
}

let client: CSpellRPCClient | undefined;
let apiOverChannel: CSpellAPI | undefined;

function getAPIOverChannel() {
    if (apiOverChannel) {
        return apiOverChannel;
    }

    const { port1, port2 } = new MessageChannel();
    createCSpellRPCServer(port1);
    client = createCSpellRPCClient(port2);
    apiOverChannel = client.getApi();
    return apiOverChannel;
}

export async function releaseCSpellAPI(): Promise<void> {
    if (usePool && pool) {
        process.stdout.write(`CSpell Worker Pool started with ${pool.size} workers. ${pool.maxWorkers} \r\n`);

        process.stdout.write(
            `${requests.toString().padStart(5)}: used: ${workerUsed.toString().padStart(5)} workers. Pool size: ${pool.size}\r\n`,
        );
    }

    await pool?.[Symbol.asyncDispose]();
    pool = undefined;
    client?.[Symbol.dispose]();
}
