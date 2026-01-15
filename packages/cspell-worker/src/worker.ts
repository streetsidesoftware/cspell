import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib/cspell-rpc';

import { startSimpleServer } from './simpleServer.js';

const port: MessagePort = workerData?.port || parentPort;

const useCSpellServer = true;

if (port) {
    console.log('CSpell Worker starting...');

    if (useCSpellServer) {
        createCSpellRPCServer(port);
    } else {
        startSimpleServer(port);
    }

    console.log('CSpell Worker started.');
}
