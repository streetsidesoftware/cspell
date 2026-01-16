import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib/cspell-rpc/server';

const port: MessagePort = workerData?.port || parentPort;

if (port) {
    createCSpellRPCServer(port);
}
