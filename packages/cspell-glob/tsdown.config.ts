import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    fixedExtension: false,
    dts: true,
    sourcemap: true,
    clean: true,
});

export default config;
