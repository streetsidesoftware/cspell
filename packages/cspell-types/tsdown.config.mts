import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

const config: UserConfig[] = defineConfig([
    {
        entry: ['src/index.ts', 'src/Parser/index.ts'],
        outDir: 'dist',
        format: ['esm', 'cjs'],
        target: 'Node20',
        fixedExtension: false,
        dts: true,
        sourcemap: true,
        clean: true,
        inlineOnly: [],
    },
    {
        // The API
        entry: ['src/index.ts'],
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
        // The Parser API
        entry: ['src/Parser/index.ts'],
        outDir: 'api/Parser',
        format: ['esm'],
        target: 'Node20',
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
        inlineOnly: [],
    },
]);

export default config;
