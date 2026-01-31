import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig([
    {
        // The API
        entry: ['src/api.ts', 'src/rpc.ts'],
        outDir: 'api',
        format: ['esm'],
        dts: { emitDtsOnly: true, sourcemap: false },
        fixedExtension: false,
        sourcemap: 'hidden',
        target: 'Node20',
        clean: true,
        inlineOnly: [],
    },
]) as UserConfig[];
