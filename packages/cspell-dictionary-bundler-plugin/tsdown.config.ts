import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const baseConfig: UserConfig = {
    entry: ['src/*.ts'],
    outDir: 'dist',
    format: ['esm'],
    deps: {
        onlyBundle: false,
    },
};

const config: UserConfig[] = createConfig([baseConfig]);

export default config;
