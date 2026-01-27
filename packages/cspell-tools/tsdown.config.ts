import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    tsconfig: './tsconfig.esm.json',
    entry: ['src/app.ts', 'src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    inlineOnly: [],
});

export default config;
