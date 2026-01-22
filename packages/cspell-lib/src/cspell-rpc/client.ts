import { randomUUID } from 'node:crypto';

import type { RPCClientConfiguration, RPCClientOptions, RPCProtocol } from '../rpc/index.js';
import { RPCClient } from '../rpc/index.js';
import type { CSpellRPCApi, CSpellRPCApiMethodNames } from './api.js';
import { CSPELL_RPC_API_ENDPOINTS } from './api.js';

export type { MessagePortLike } from '../rpc/index.js';

export type CSpellRPCClientOptions = RPCClientOptions;
export type CSpellRPCClientConfig = RPCClientConfiguration;

export class CSpellRPCClient extends RPCClient<CSpellRPCApi> {
    constructor(config: CSpellRPCClientConfig) {
        super({ randomUUID, ...config });
    }

    getApi(): RPCProtocol<CSpellRPCApi> {
        return super.getApi(Object.keys(CSPELL_RPC_API_ENDPOINTS) as CSpellRPCApiMethodNames[]);
    }
}

/**
 * Create a CSpell RPC Client.
 * @param config - Client configuration
 * @returns CSpellRPCClient
 */
export function createCSpellRPCClient(config: CSpellRPCClientConfig): CSpellRPCClient {
    return new CSpellRPCClient(config);
}
