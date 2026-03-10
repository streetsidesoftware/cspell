import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const baseConfig: UserConfig = {
    entry: ['src/index.ts', 'src/worker.ts'],
    // ...deps({ alwaysBundle: ['cspell-lib/cspell-rpc/server'] }),
    outDir: 'dist',
    format: ['esm'],
    fixedExtension: false,
};

const config: UserConfig[] = createConfig([baseConfig]);

export default config;
