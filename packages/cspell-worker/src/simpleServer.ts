import type { MessagePort } from 'node:worker_threads';

import { RPCServer } from 'cspell-lib/rpc';

export function startSimpleServer(port: MessagePort): void {
    const api = {
        add: (a: number, b: number): number => a + b,
        sub: (a: number, b: number): number => a - b,
        mul: (a: number, b: number): number => a * b,
        div: (a: number, b: number): number => a / b,
        sleep: wait,
        error: (message: string): void => {
            throw new Error(message);
        },
    } as const;

    new RPCServer(port, api, {});
}

export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
