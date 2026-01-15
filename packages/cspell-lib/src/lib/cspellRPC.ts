import { randomUUID } from 'node:crypto';

import type { RPCClientOptions, RPCProtocol, RPCServerOptions } from '../rpc/index.js';
import { type MessagePortLike, RPCClient, RPCServer } from '../rpc/index.js';
import { spellCheckDocumentRPC } from './spellCheckFile.js';

export type { MessagePortLike } from '../rpc/index.js';

export interface CSpellRPCApi {
    spellCheckDocument: typeof spellCheckDocumentRPC;
}

const cspellRPCApi: CSpellRPCApi = {
    spellCheckDocument: spellCheckDocumentRPC,
};

export type CSpellRPCServerOptions = RPCServerOptions;

export class CSpellRPCServer extends RPCServer<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCServerOptions) {
        super(port, cspellRPCApi, options);
    }
}

export function createCSpellRPCServer(port: MessagePortLike, options?: CSpellRPCServerOptions): CSpellRPCServer {
    return new CSpellRPCServer(port, { ...options });
}

export type CSpellRPCClientOptions = RPCClientOptions;

export class CSpellRPCClient extends RPCClient<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCClientOptions) {
        super(port, { randomUUID, ...options });
    }

    getApi(): RPCProtocol<CSpellRPCApi> {
        return super.getApi(Object.keys(cspellRPCApi) as Array<keyof CSpellRPCApi>);
    }
}
