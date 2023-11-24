/** @type { import("@cspell/cspell-types").CSpellUserSettings } */

const cspell = {
    description: 'cspell.config.js file in samples/esm-config',
    languageSettings: [
        {
            languageId: 'cpp',
            allowCompoundWords: false,
            patterns: [
                {
                    name: 'pound-includes',
                    pattern: /^\s*#include.*/g,
                },
            ],
            ignoreRegExpList: ['pound-includes'],
        },
    ],
    dictionaryDefinitions: [
        {
            name: 'custom-words',
            path: './custom-words.txt',
        },
    ],
    dictionaries: ['custom-words'],
};

export default cspell;
