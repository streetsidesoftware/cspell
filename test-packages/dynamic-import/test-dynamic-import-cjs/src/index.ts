import { dynamicImport } from '@cspell/dynamic-import';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export function getPipes(): Promise<typeof import('@cspell/cspell-pipe')> {
    return dynamicImport('@cspell/cspell-pipe', __dirname);
}
