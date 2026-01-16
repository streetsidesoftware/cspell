import type { spellCheckDocumentRPC } from './spellCheckFile.js';

export interface CSpellRPCApi {
    spellCheckDocument: typeof spellCheckDocumentRPC;
}

export type CSpellRPCApiMethodNames = keyof CSpellRPCApi;

export type CSpellRPCApiEndpointNames = {
    [K in CSpellRPCApiMethodNames]: K;
};

export const CSPELL_RPC_API_ENDPOINTS: CSpellRPCApiEndpointNames = {
    spellCheckDocument: 'spellCheckDocument',
};
