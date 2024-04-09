import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import cspellRecommended from '@cspell/eslint-plugin/recommended';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended-module'],
    {
        rules: {
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
        },
    },
    cspellRecommended,
    {
        rules: {
            '@cspell/spellchecker': [
                'warn',
                {
                    debugMode: false,
                    autoFix: true,
                    cspell: {
                        dictionaries: ['business-terminology'],
                        dictionaryDefinitions: [
                            {
                                name: 'business-terminology',
                                path: './dictionaries/business-terminology.txt',
                            },
                        ],
                    },
                },
            ],
        },
    },
];

export default config;
