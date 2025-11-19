import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.ts', 'src/Parser/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
});
