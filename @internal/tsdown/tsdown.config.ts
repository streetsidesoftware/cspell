import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./config.ts'],
    outDir: '.',
    format: ['esm'],
    fixedExtension: false,
    clean: false,
    dts: true,
    sourcemap: false,
    deps: { neverBundle: ['tsdown'] },
}) as UserConfig;
