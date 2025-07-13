import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/api.ts'],
        outDir: 'api',
        format: ['esm'],
        dts: { emitDtsOnly: true, sourcemap: false, resolve: true /* dtsInput: true */ },
        sourcemap: 'hidden',
        clean: true,
    },
]);
