import type { MessagePortLike, RPCServerOptions } from '../rpc/index.js';
import { RPCServer } from '../rpc/index.js';
import type { CSpellRPCApi } from './api.js';
import type { spellCheckDocumentRPC } from './spellCheckFile.js';

export type { MessagePortLike } from '../rpc/index.js';

export type CSpellRPCServerOptions = RPCServerOptions;

export class CSpellRPCServer extends RPCServer<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCServerOptions) {
        super(port, getCSpellRPCApi(), options);
    }
}

export function createCSpellRPCServer(port: MessagePortLike, options?: CSpellRPCServerOptions): CSpellRPCServer {
    return new CSpellRPCServer(port, options);
}

let pSpellCheckFileJs: Promise<{ spellCheckDocumentRPC: typeof spellCheckDocumentRPC }> | undefined = undefined;

/**
 * Get the CSpell RPC API.
 *
 * NOTE: This function lazy loads the implementation to avoid loading unnecessary code during initialization of workers.
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
