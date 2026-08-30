import type { UserConfig } from '@internal/tsdown';
import { createConfig, deps } from '@internal/tsdown';

const config: UserConfig = createConfig({
    entry: ['src/index.ts'],
    outDir: 'dist/tsdown',
    format: ['esm', 'cjs'],
    ...deps({ alwaysBundle: ['cspell-glob'] }),
    fixedExtension: false,
    dts: false,
    sourcemap: true,
});

export default config;
