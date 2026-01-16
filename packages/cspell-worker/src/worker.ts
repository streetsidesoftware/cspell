import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

import { createCSpellRPCServer } from 'cspell-lib/cspell-rpc/server';

if (parentPort) {
    const serverPort: MessagePort = workerData?.port || parentPort;
    const workerPort: MessagePort = parentPort;

    workerPort.postMessage('status:starting');

    // Attach a simple echo server to the parent port to keep the worker alive.
    workerPort.on('message', (message: unknown) => {
        if (typeof message !== 'string') return;
        if (message === 'status:ok') {
            workerPort.postMessage(message);
        }
        if (message.startsWith('echo:')) {
            workerPort.postMessage(message);
        }
    });

    if (serverPort) {
        workerPort.postMessage('status:server:starting');
        createCSpellRPCServer(serverPort);
        workerPort.postMessage('status:server:ready');
    }

    workerPort.postMessage('status:ready');
}
