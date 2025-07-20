import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/app.ts'],
        outDir: 'lib',
        format: ['esm'],
        clean: true,
    },
]);
