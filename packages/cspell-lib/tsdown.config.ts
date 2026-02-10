import dictionaryBundler from '@cspell/dictionary-bundler-plugin/rolldown';
import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/api.ts', 'src/rpc.ts'],
        outDir: 'api',
        format: ['esm'],
        target: 'Node20',
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
        inlineOnly: [],
    },
    {
        // The API
        entry: ['fixtures/dictionaries/btrie/*.bundle.js'],
        outDir: 'dist/test/fixtures/dictionaries/btrie',
        format: ['esm'],
        target: 'Node20',
        tsconfig: 'fixtures/tsconfig.json',
        sourcemap: false,
        plugins: [dictionaryBundler()],
        clean: true,
        inlineOnly: [],
    },
]) as UserConfig[];
