import type { UserConfig } from '@internal/tsdown';
import { createConfig, deps } from '@internal/tsdown';

const config: UserConfig = createConfig({
    entry: ['src/index.ts', 'src/bin.ts'],
    outDir: 'dist/tsdown',
    format: ['esm', 'cjs'],
    ...deps({ alwaysBundle: ['@cspell/strong-weak-map'] }),
    fixedExtension: false,
    dts: true,
    sourcemap: false,
});

export default config;
