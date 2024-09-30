/**
 * Requires CSpell Version 7 or later
 * VSCode Spell Checker Version 3 or later
 */
const path = require('node:path');

const { glob } = require('tinyglobby');

function getDictionaries() {
    return glob(['dictionaries/*.txt'], { cwd: __dirname });
}

async function createConfig() {
    const dictFiles = await getDictionaries();
    const dictionaryDefinitions = dictFiles.map((dict) => ({ name: path.parse(dict).name, path: dict }));

    return {
        dictionaryDefinitions,
        dictionaries: dictionaryDefinitions.map((dict) => dict.name),
    };
}

module.exports = createConfig();
