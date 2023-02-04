import { dynamicImport } from '@cspell/dynamic-import';

export function getPipes(): Promise<typeof import('@cspell/cspell-pipe')> {
    return dynamicImport('@cspell/cspell-pipe', import.meta.url);
}
