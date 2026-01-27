import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig[] = defineConfig([
    {
        // The API
        entry: ['src/api.ts', 'src/rpc.ts'],
        outDir: 'api',
        format: ['esm'],
        dts: { emitDtsOnly: true, sourcemap: false },
        fixedExtension: false,
        sourcemap: 'hidden',
        clean: true,
        inlineOnly: [],
    },
]);

export default config;
