import { spellCheckDocument, spellCheckDocumentRPC } from 'cspell-lib';
import type { CSpellRPCApi } from 'cspell-lib/cspell-rpc';

export interface CSpellAPI extends Pick<CSpellRPCApi, 'spellCheckDocument'> {}

const usePRC = false;

const api = {
    spellCheckDocument,
} as const;

export const apiRPC: CSpellAPI = {
    spellCheckDocument: spellCheckDocumentRPC,
} as const;

export function getCSpellAPI(): Promise<CSpellAPI> {
    return Promise.resolve(usePRC ? apiRPC : api);
}
