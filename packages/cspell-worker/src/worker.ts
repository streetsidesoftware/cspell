import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

const port: MessagePort = workerData?.port || parentPort;

if (parentPort && parentPort !== port) {
    // Attach a simple echo server to the parent port to keep the worker alive.
    parentPort.on('message', (message: unknown) => {
        parentPort?.postMessage(message);
    });
}

if (port) {
    // Delay the import to avoid the worker exiting before the server is started because there are no listeners.
    setTimeout(async () => {
        const { createCSpellRPCServer } = await import('cspell-lib/cspell-rpc/server');
        createCSpellRPCServer(port);
    }, 1);
}
