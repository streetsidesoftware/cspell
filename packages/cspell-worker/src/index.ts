import { MessageChannel, Worker } from 'node:worker_threads';

import type { CSpellRPCClient } from 'cspell-lib';
import { createCSpellRPCClient } from 'cspell-lib';

export interface CSpellWorkerInstance {
    worker: Worker;
    client: CSpellRPCClient;
}

export function startCSpellWorker(): CSpellWorkerInstance {
    console.log('Create CSpell Worker...');
    const messageChannel = new MessageChannel();
    const { port1, port2 } = messageChannel;

    const worker = new Worker(new URL('worker.js', import.meta.url), {
        workerData: { port: port1 },
        transferList: [port1],
        stderr: true,
        stdout: true,
    });

    const client = createCSpellRPCClient(port2);

    console.log('Create CSpell Worker...Done.');

    return { worker, client };
}
