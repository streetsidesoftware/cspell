import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const baseConfig: UserConfig = {
    entry: ['src/*.ts'],
    outDir: 'dist',
    format: ['esm'],
    deps: {
        onlyAllowBundle: false,
    },
};

const config: UserConfig[] = createConfig([baseConfig]);

export default config;
