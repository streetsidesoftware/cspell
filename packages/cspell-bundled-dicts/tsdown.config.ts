import dictionaryBundler from '@cspell/dictionary-bundler-plugin/rolldown';
import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

export default createConfig([
    {
        // The API
        entry: ['src/cspell-bundled.js'],
        outDir: 'dist',
        format: ['esm'],
        sourcemap: false,
        dts: false,
        // plugins: [dictionaryBundler({ include: [/cspell-default/], debug: false })],
        plugins: [dictionaryBundler({ include: [/no-match/], debug: false })],
        clean: true,
    },
]) as UserConfig[];
