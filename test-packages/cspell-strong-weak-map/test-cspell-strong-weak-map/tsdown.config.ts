import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/index.ts', 'src/bin.ts'],
        outDir: 'dist/tsdown',
        format: ['esm', 'cjs'],
        noExternal: ['@cspell/strong-weak-map'],
        dts: true,
        sourcemap: true,
        clean: true,
    },
]);
