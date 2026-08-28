import type { UserConfig } from '@internal/tsdown';
import { createConfig, deps } from '@internal/tsdown';

const baseConfig: UserConfig = {
    entry: ['src/index.ts'],
    outDir: 'dist',
    fixedExtension: false,
    platform: 'neutral',
    ...deps({ onlyBundle: ['gensequence'] }),
};

const config: UserConfig[] = createConfig([baseConfig]);

export default config;
