import type { spellCheckDocumentRPC } from './spellCheckFile.js';

export interface CSpellRPCApi {
    spellCheckDocument: typeof spellCheckDocumentRPC;
    /**
     * Sleeps for the given number of milliseconds.
     *
     * **Note:** This is primarily for testing purposes.
     *
     * @param ms - The number of milliseconds to sleep.
     * @returns A promise that resolves with the number of milliseconds slept.
     */
    sleep: (ms: number) => Promise<number>;

    /**
     * Returns the given message.
     *
     * **Note:** This is primarily for testing purposes.
     *
     * @param msg - The message to echo.
     * @returns A promise that resolves with the given message.
     */
    echo: (msg: string) => Promise<string>;
}

export type CSpellRPCApiMethodNames = keyof CSpellRPCApi;

export type CSpellRPCApiEndpointNames = {
    [K in CSpellRPCApiMethodNames]: K;
};

export const CSPELL_RPC_API_ENDPOINTS: CSpellRPCApiEndpointNames = {
    spellCheckDocument: 'spellCheckDocument',
    sleep: 'sleep',
    echo: 'echo',
};
