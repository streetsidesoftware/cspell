import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig[] = defineConfig([
    {
        entry: ['src/index.mts', 'src/app.mts', 'src/application.mts'],
        outDir: 'dist/esm',
        format: ['esm'],
        fixedExtension: false,
        dts: true,
        sourcemap: true,
        clean: true,
        inlineOnly: [],
    },
    {
        entry: ['src/commonJsApi.ts'],
        outDir: 'dist/cjs',
        format: ['cjs'],
        fixedExtension: true,
        dts: true,
        sourcemap: true,
        clean: true,
        inlineOnly: [],
    },
]);

export default config;
