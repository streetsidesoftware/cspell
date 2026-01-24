import { defineConfig, type UserConfig } from 'tsdown';

const baseConfig: UserConfig = {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    target: 'Node20',
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
};

const config: UserConfig[] = defineConfig([baseConfig]);

export default config;
