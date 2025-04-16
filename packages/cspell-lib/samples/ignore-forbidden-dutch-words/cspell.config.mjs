// ts-check

import fs from 'node:fs/promises'
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@cspell/cspell-types';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const sampleConfigFile = require.resolve('@cspell/dict-nl-nl/cspell-ext.json')
const sampleDir = path.dirname(sampleConfigFile);

const dutchConfig = JSON.parse(await fs.readFile(sampleConfigFile, 'utf-8'));



/**
 *
 * @param {import('@cspell/cspell-types').CSpellUserSettings} config
 */
function adjustDictDef(config) {
    const defs = config.dictionaryDefinitions || [];

    for (const def of defs) {
        if (def.path?.includes('.trie')) {
            def.ignoreForbiddenWords = true;
            def.path = path.relative(__dirname, path.resolve(sampleDir, def.path));
        }
    }

    return config;
}

export default defineConfig({
    ...adjustDictDef(dutchConfig),
    language: 'nl,en',
});
