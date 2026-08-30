import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const config: UserConfig = createConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    fixedExtension: false,
    deps: {
        neverBundle: ['@cspell/cspell-bundled-dicts'], // Exclude these packages from the bundle
    },
    dts: true,
    sourcemap: true,
});

export default config;
