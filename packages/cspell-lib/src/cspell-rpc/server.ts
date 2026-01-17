import type { MessagePortLike, RPCServerOptions } from '../rpc/index.js';
import { RPCServer } from '../rpc/index.js';
import type { CSpellRPCApi } from './api.js';
import { spellCheckDocumentRPC } from './spellCheckFile.js';

export type { MessagePortLike } from '../rpc/index.js';

export type CSpellRPCServerOptions = RPCServerOptions;

export class CSpellRPCServer extends RPCServer<CSpellRPCApi> {
    constructor(port: MessagePortLike, options?: CSpellRPCServerOptions) {
        super(port, getCSpellRPCApi(), options);
    }
}

/**
 * Create a CSpell RPC Server that listens on the given port.
 * @param port - The message port to listen on.
 * @param options - Options for the RPC server.
 * @returns The CSpell RPC Server.
 */
export function createCSpellRPCServer(port: MessagePortLike, options?: CSpellRPCServerOptions): CSpellRPCServer {
    return new CSpellRPCServer(port, options);
}

/**
 * Get the CSpell RPC API.
 *
 * @returns the api implementation.
 */
function getCSpellRPCApi(): CSpellRPCApi {
    return {
        spellCheckDocument: spellCheckDocumentRPC,
        sleep,
        echo,
    };
}

function echo(msg: string): Promise<string> {
    return Promise.resolve(msg);
}

function sleep(ms: number): Promise<number> {
    return new Promise((resolve) => {
        const start = performance.now();
        setTimeout(() => resolve(performance.now() - start), ms);
    });
}
