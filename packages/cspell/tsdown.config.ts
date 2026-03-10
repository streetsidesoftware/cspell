import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

export default createConfig([
    {
        entry: ['src/index.mts', 'src/app.mts', 'src/application.mts'],
        outDir: 'dist/esm',
        format: ['esm'],
        fixedExtension: false,
    },
    {
        entry: ['src/commonJsApi.ts'],
        outDir: 'dist/cjs',
        format: ['cjs'],
        fixedExtension: true,
    },
]) as UserConfig[];
