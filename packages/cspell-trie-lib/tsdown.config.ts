import type { UserConfig } from '@internal/tsdown';
import { createConfig, deps } from '@internal/tsdown';

const baseConfig: UserConfig = {
    entry: ['src/index.ts'],
    outDir: 'dist',
    fixedExtension: false,
    platform: 'neutral',
    ...deps({ onlyAllowBundle: ['gensequence'] }),
};

const config: UserConfig[] = createConfig([baseConfig]);

export default config;
