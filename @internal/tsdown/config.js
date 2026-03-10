import { defineConfig as defineConfig$1 } from 'tsdown';
//#region config.ts
const defaultDeps = { onlyAllowBundle: [] };
const defaultConfig = {
    outDir: 'dist',
    format: ['esm'],
    target: 'Node20',
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    deps: defaultDeps,
};
function createConfig(config) {
    if (Array.isArray(config))
        return defineConfig$1(
            config.map((c) => ({
                ...defaultConfig,
                ...c,
            })),
        );
    return defineConfig$1({
        ...defaultConfig,
        ...config,
    });
}
/**
 * Merge the provided deps config with the default deps config.
 *
 * Usage:
 * ```ts
 * import { createConfig, deps } from '@internal/tsdown';
 *
 * const config = createConfig({
 *     entry: ['src/index.ts'],
 *     outDir: 'dist',
 *     ...deps({ onlyAllowBundle: ['gensequence'] }),
 * });
 * ```
 * @param deps - config to merge
 * @returns a config object with the merged deps config
 */
function deps(deps) {
    return {
        deps: {
            ...defaultDeps,
            ...deps,
        },
    };
}
//#endregion
export { createConfig, defaultConfig, defaultDeps, deps };

export { defineConfig } from 'tsdown';
