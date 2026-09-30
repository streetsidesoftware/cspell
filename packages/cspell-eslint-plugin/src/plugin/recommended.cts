import type { Linter } from 'eslint';

import { plugin } from './cspell-eslint-plugin.cjs';

export const plugins: NonNullable<Linter.Config['plugins']> = {
    '@cspell': plugin,
};

export const rules: NonNullable<Linter.Config['rules']> = {
    '@cspell/spellchecker': ['warn', {}],
};
