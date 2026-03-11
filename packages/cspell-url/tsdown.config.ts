import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const config: UserConfig = createConfig({
    entry: ['src/index.mts'],
    outDir: 'dist',
    format: ['esm'],
    fixedExtension: false,
});

export default config;
