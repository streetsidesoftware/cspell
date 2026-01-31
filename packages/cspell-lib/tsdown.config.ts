import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/api.ts', 'src/rpc.ts'],
        outDir: 'api',
        format: ['esm'],
        target: 'Node20',
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
        inlineOnly: [],
    },
]) as UserConfig[];
