import type { UserConfig } from '@internal/tsdown';
import { createConfig, deps } from '@internal/tsdown';

const config: UserConfig = createConfig({
    entry: ['src/index.mts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    ...deps({ alwaysBundle: [/^@cspell\/cspell-pipe(\/|$)/] }),
    fixedExtension: true,
    dts: false,
    sourcemap: true,
});

export default config;
