// ts-check
// import eslint from '@eslint/js';
import cspellRecommended from '@cspell/eslint-plugin/recommended';
import tsESLint from 'typescript-eslint';
import Path from 'node:path';

/**
 * @type { import("eslint").Linter.Config[] }
 */
export default tsESLint.config(
    // eslint.configs.recommended,
    {
        files: ['**/*.*ts'],
        plugins: {
            '@typescript-eslint': tsESLint.plugin,
        },
        languageOptions: {
            parser: tsESLint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {},
    },
    cspellRecommended,
    {
        files: ['**/*.*js', '**/*.*ts'],
        rules: {
            '@cspell/spellchecker': ['error'],
        },
    },
);
