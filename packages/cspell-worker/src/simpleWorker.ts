import type { MessagePort } from 'node:worker_threads';
import { parentPort, workerData } from 'node:worker_threads';

import { startSimpleServer } from './simpleServer.js';

const port: MessagePort = workerData?.port || parentPort;

if (port) {
    startSimpleServer(port);
}
