import { parentPort, workerData } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib/cspell-rpc/server';

if (parentPort) {
    createCSpellRPCServer(workerData?.port || parentPort);
}
