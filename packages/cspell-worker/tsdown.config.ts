import { defineConfig, type UserConfig } from 'tsdown';

const baseConfig: UserConfig = {
    entry: ['src/index.ts', 'src/worker.ts'],
    // noExternal: ['cspell-lib/cspell-rpc/server'],
    outDir: 'dist',
    format: ['esm'],
    target: 'Node20',
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    inlineOnly: [],
};

const config: UserConfig[] = defineConfig([baseConfig]);

export default config;
