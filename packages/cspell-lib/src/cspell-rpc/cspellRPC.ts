import { randomUUID } from 'node:crypto';

import type { MessagePortLike, RPCClientOptions, RPCProtocol, RPCServerOptions } from '../rpc/index.js';
import { RPCClient, RPCServer } from '../rpc/index.js';
import type { spellCheckDocumentRPC } from './spellCheckFile.js';

export type { MessagePortLike } from '../rpc/index.js';

export interface CSpellRPCApi {
    spellCheckDocument: typeof spellCheckDocumentRPC;
}

export type CSpellRPCServerOptions = RPCServerOptions;

export class CSpellRPCServer extends RPCServer<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCServerOptions) {
        super(port, getCSpellRPCApi(), options);
    }
}

export function createCSpellRPCServer(port: MessagePortLike, options?: CSpellRPCServerOptions): CSpellRPCServer {
    return new CSpellRPCServer(port, options);
}

export type CSpellRPCClientOptions = RPCClientOptions;

export class CSpellRPCClient extends RPCClient<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCClientOptions) {
        super(port, { randomUUID, ...options });
    }

    getApi(): RPCProtocol<CSpellRPCApi> {
        return super.getApi(Object.keys(getCSpellRPCApi()) as Array<keyof CSpellRPCApi>);
    }
}

export function createCSpellRPCClient(port: MessagePortLike, options?: CSpellRPCClientOptions): CSpellRPCClient {
    return new CSpellRPCClient(port, options);
}

let pSpellCheckFileJs: Promise<{ spellCheckDocumentRPC: typeof spellCheckDocumentRPC }> | undefined = undefined;

/**
 * Get the CSpell RPC API.
 *
 * NOTE: This function lazy loads the implementation to avoid loading unnecessary during initialization of workers.
 *
 * @returns the api implementation.
 */
function getCSpellRPCApi(): CSpellRPCApi {
    return {
        spellCheckDocument: async (...params) => {
            const { spellCheckDocumentRPC } = await getSpellCheckFileJs();
            return spellCheckDocumentRPC(...params);
        },
    };

    function getSpellCheckFileJs() {
        pSpellCheckFileJs ??= import('./spellCheckFile.js');
        return pSpellCheckFileJs;
    }
}
