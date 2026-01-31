import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/index.mts', 'src/app.mts', 'src/application.mts'],
        outDir: 'dist/esm',
        format: ['esm'],
        target: 'Node20',
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
        target: 'Node20',
        fixedExtension: true,
        dts: true,
        sourcemap: true,
        clean: true,
        inlineOnly: [],
    },
]) as UserConfig[];
