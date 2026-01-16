import { defineConfig } from 'tsup';

const config: ReturnType<typeof defineConfig> = defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true,
    clean: true,
});

export default config;
