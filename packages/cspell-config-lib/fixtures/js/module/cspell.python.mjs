import { readFile } from 'node:fs/promises';

/**
 * @returns {Promise<import('@cspell/cspell-types').CSpellUserSettings>}
 */
export default async function getConfig() {
    const words = (await readFile(new URL('requirements.txt', import.meta.url), 'utf8'))
        .replace(/[.,]|([=<>].*)/g, ' ')
        .split(/\s+/g);
    return { id: 'python-imports', words };
}
