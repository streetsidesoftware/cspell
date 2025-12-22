import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    tsconfig: './tsconfig.esm.json',
    entry: ['src/app.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
});

export default config;
