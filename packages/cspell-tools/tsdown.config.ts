import type { UserConfig } from '@internal/tsdown';
import { createConfig } from '@internal/tsdown';

const config: UserConfig = createConfig({
    tsconfig: './tsconfig.esm.json',
    entry: ['src/app.ts', 'src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
});

export default config;
