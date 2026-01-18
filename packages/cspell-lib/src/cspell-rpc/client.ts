import { randomUUID } from 'node:crypto';

import type { MessagePortLike, RPCClientOptions, RPCProtocol, RPCServerOptions } from '../rpc/index.js';
import { RPCClient } from '../rpc/index.js';
import type { CSpellRPCApi, CSpellRPCApiMethodNames } from './api.js';
import { CSPELL_RPC_API_ENDPOINTS } from './api.js';

export type { MessagePortLike } from '../rpc/index.js';

export type CSpellRPCServerOptions = RPCServerOptions;

export type CSpellRPCClientOptions = RPCClientOptions;

export class CSpellRPCClient extends RPCClient<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCClientOptions) {
        super(port, { randomUUID, ...options });
    }

    getApi(): RPCProtocol<CSpellRPCApi> {
        return super.getApi(Object.keys(CSPELL_RPC_API_ENDPOINTS) as CSpellRPCApiMethodNames[]);
    }
}

export function createCSpellRPCClient(port: MessagePortLike, options?: CSpellRPCClientOptions): CSpellRPCClient {
    return new CSpellRPCClient(port, options);
}
