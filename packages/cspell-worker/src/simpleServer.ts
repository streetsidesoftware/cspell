import { randomUUID } from 'node:crypto';
import type { MessagePort } from 'node:worker_threads';

import type { RPCClientOptions, RPCProtocol } from 'cspell-lib/rpc';
import { RPCClient, RPCServer } from 'cspell-lib/rpc';

export interface SimpleServerAPI {
    add(a: number, b: number): number;
    sub(a: number, b: number): number;
    mul(a: number, b: number): number;
    div(a: number, b: number): number;
    sleep(ms: number): Promise<void>;
    error(message: string): void;
}

const api: SimpleServerAPI = {
    add: (a: number, b: number): number => a + b,
    sub: (a: number, b: number): number => a - b,
    mul: (a: number, b: number): number => a * b,
    div: (a: number, b: number): number => a / b,
    sleep: wait,
    error: (message: string): void => {
        throw new Error(message);
    },
} as const;

export function startSimpleServer(port: MessagePort): void {
    new RPCServer(port, api, {});
}

export function startSimpleRPCClient(port: MessagePort, options?: RPCClientOptions): SimpleRPCClient {
    return new SimpleRPCClient(port, options);
}

export class SimpleRPCClient extends RPCClient<SimpleServerAPI> {
    constructor(port: MessagePort, options?: RPCClientOptions) {
        super(port, { randomUUID, ...options });
    }

    get api(): RPCProtocol<SimpleServerAPI> {
        return this.getApi(Object.keys(api) as (keyof SimpleServerAPI)[]);
    }
}

export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
