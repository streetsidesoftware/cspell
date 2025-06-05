// @ts-check
import eslint from '@eslint/js';
import { defineCSpellConfig, defineCSpellPluginOptions } from '@cspell/eslint-plugin';
import cspellRecommended from '@cspell/eslint-plugin/recommended';

/**
 * @type { import("eslint").Linter.Config[] }
 */
const config = [
    eslint.configs.recommended,
    cspellRecommended,
    {
        ignores: ['eslint.config.mjs'],
    },
    {
        files: ['**/*.js'],
        rules: {
            '@cspell/spellchecker': [
                'warn',
                defineCSpellPluginOptions({
                    debugMode: false,
                    autoFix: false,
                    cspell: defineCSpellConfig({
                        dictionaryDefinitions: [
                            {
                                name: 'custom-dict',
                                supportNonStrictSearches: false,
                                // cspell: words Codeco
                                words: ['IPv4', 'IPv6', 'Codeco'],
                                suggestWords: ['codeco->Codeco'],
                            },
                        ],
                        dictionaries: ['custom-dict'],
                    }),
                }),
            ],
        },
    },
];

export default config;
