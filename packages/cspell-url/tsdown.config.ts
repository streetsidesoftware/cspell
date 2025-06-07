import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.mts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
});
