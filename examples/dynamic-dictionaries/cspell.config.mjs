/**
 * Requires CSpell Version 8.0.0 or later
 * VSCode Spell Checker Version 4.0.0 or later
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'tinyglobby';

const __dir = fileURLToPath(new URL('.', import.meta.url));

function getDictionaries() {
    return glob(['dictionaries/*.txt'], { cwd: __dir });
}

async function createConfig() {
    const dictFiles = await getDictionaries();
    const dictionaryDefinitions = dictFiles.map((dict) => ({ name: path.parse(dict).name, path: dict }));

    return {
        dictionaryDefinitions,
        dictionaries: dictionaryDefinitions.map((dict) => dict.name),
    };
}

export default createConfig();
