import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const config: UserConfig[] = createConfig([
    {
        entry: ['src/index.ts', 'src/Parser/index.ts'],
        outDir: 'dist',
        format: ['esm', 'cjs'],
        fixedExtension: false,
        dts: true,
        sourcemap: true,
        clean: true,
    },
    {
        // The API
        entry: ['src/index.ts'],
        outDir: 'api',
        format: ['esm'],
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
    },
    {
        // The Parser API
        entry: ['src/Parser/index.ts'],
        outDir: 'api/Parser',
        format: ['esm'],
        fixedExtension: false,
        dts: { emitDtsOnly: true, sourcemap: false },
        sourcemap: 'hidden',
        clean: true,
    },
]);

export default config;
