import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    entry: ['src/index.ts', 'src/bin.ts'],
    outDir: 'dist/tsdown',
    format: ['esm', 'cjs'],
    noExternal: ['@cspell/strong-weak-map'],
    fixedExtension: false,
    dts: true,
    sourcemap: false,
    clean: true,
    inlineOnly: [],
});

export default config;
