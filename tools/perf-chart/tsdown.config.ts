import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/app.ts'],
    outDir: 'lib',
    format: ['esm'],
    fixedExtension: false,
    clean: true,
});
