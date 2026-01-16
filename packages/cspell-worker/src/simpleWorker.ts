import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

import { startSimpleServer } from './simpleServer.js';

const port: MessagePort = workerData?.port || parentPort;

if (parentPort && parentPort !== port) {
    // Attach a simple echo server to the parent port to keep the worker alive.
    parentPort.on('message', (message: unknown) => {
        parentPort?.postMessage(message);
    });
}

if (port) {
    startSimpleServer(port);
}
