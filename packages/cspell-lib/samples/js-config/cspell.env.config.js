'use strict';

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
    description: 'Example config using environment variables.',
    dictionaryDefinitions: [
        {
            name: 'repo-dict',
            path: `${process.env['GITHUB_WORKSPACE']}/.github/etc/dictionary.txt`,
        },
    ],
    dictionaries: ['repo-dict'],
};

module.exports = cspell;
