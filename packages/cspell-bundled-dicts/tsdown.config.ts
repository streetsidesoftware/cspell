import dictionaryBundler from '@cspell/dictionary-bundler-plugin/rolldown';
import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/cspell-bundled.js'],
        outDir: 'dist',
        format: ['esm'],
        target: 'Node20',
        sourcemap: false,
        // plugins: [dictionaryBundler({ include: [/cspell-default/], debug: false })],
        plugins: [dictionaryBundler({ include: [/no-match/], debug: false })],
        clean: true,
        inlineOnly: [],
    },
]) as UserConfig[];
