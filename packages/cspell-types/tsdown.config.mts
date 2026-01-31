import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    entry: ['src/index.ts', 'src/Parser/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    target: 'Node20',
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
    inlineOnly: [],
});

export default config;
