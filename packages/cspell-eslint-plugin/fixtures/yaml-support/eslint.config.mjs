import eslint from '@eslint/js';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import parserYml from 'yaml-eslint-parser';
import pluginYml from 'eslint-plugin-yml';

/**
 * @type { import("eslint").Linter.FlatConfig[] }
 */
const config = [
    eslint.configs.recommended,
    cspellRecommended,
    ...pluginYml.configs['flat/standard'],
    {
        files: ['**/*.yaml', '**/*.yml'],
        languageOptions: {
            parser: parserYml,
        },
        // plugins: {
        //     yml: pluginYml,
        // },
        rules: {
            '@cspell/spellchecker': 'warn',
        },
    },
];

export default config;
