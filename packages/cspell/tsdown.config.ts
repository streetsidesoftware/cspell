import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: [
        'src/index.mts',
        // 'src/app.mts',
        'src/application.mts',
    ],
    outDir: 'dist/esm',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
});
