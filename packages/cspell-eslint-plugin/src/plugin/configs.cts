import type { Linter } from 'eslint';

import { plugin } from './cspell-eslint-plugin.cjs';
export * as recommended from './recommended.cjs';

export const debug: Linter.Config = {
    plugins: {
        '@cspell': plugin,
    },
    rules: {
        '@cspell/spellchecker': ['warn', { debugMode: true }],
    },
};
