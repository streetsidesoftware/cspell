import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.mts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
});
