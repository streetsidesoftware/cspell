import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/api.ts'],
        outDir: 'api',
        format: ['esm'],
        dts: { emitDtsOnly: true, sourcemap: false, resolve: true /* dtsInput: true */ },
        fixedExtension: false,
        sourcemap: 'hidden',
        clean: true,
    },
]);
