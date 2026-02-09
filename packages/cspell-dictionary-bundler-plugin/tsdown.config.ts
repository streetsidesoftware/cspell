import { defineConfig, type UserConfig } from 'tsdown';

const baseConfig: UserConfig = {
    entry: ['src/*.ts'],
    outDir: 'dist',
    format: ['esm'],
    target: 'Node20',
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    inlineOnly: false,
};

const config: UserConfig[] = defineConfig([baseConfig]);

export default config;
