import dictionaryBundler from '@cspell/dictionary-bundler-plugin/rolldown';
import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

export default createConfig([
    {
        // The API
        entry: ['src/api.ts', 'src/rpc.ts'],
        outDir: 'api',
        format: ['esm'],
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
    },
    {
        // Testing the Plugin
        entry: ['fixtures/dictionaries/btrie/*.bundle.js'],
        outDir: 'dist/test/fixtures/dictionaries/btrie',
        format: ['esm'],
        tsconfig: 'fixtures/tsconfig.json',
        dts: false,
        sourcemap: false,
        plugins: [dictionaryBundler()],
        clean: true,
    },
]) as UserConfig[];
