import { parentPort } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib';

if (parentPort) {
    createCSpellRPCServer(parentPort);
}
