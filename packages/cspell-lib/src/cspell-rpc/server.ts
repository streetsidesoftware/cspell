import type { RPCServerConfiguration, RPCServerOptions } from '@cspell/rpc';
import { RPCServer } from '@cspell/rpc';

import type { CSpellRPCApi } from './api.js';
import { spellCheckDocumentRPC } from './spellCheckFile.js';

export type { MessagePortLike } from '@cspell/rpc';

export type CSpellRPCServerOptions = RPCServerOptions;
export type CSpellRPCServerConfig = RPCServerConfiguration;

export class CSpellRPCServer extends RPCServer<CSpellRPCApi> {
    constructor(config: CSpellRPCServerConfig) {
        super(config, getCSpellRPCApi());
    }
}

/**
 * Create a CSpell RPC Server that listens on the given port.
 * @param config - Server configuration.
 * @returns The CSpell RPC Server.
 */
export function createCSpellRPCServer(config: CSpellRPCServerConfig): CSpellRPCServer {
    return new CSpellRPCServer(config);
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
