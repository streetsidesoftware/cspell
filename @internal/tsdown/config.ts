import type { DepsConfig, UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

export type { UserConfig } from 'tsdown';
export { defineConfig } from 'tsdown';

export const defaultDeps: DepsConfig = {
    onlyAllowBundle: [],
};

export const defaultConfig: UserConfig = {
    outDir: 'dist',
    format: ['esm'],
    target: 'Node20',
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    deps: defaultDeps,
};

export function createConfig(config: UserConfig[]): UserConfig[];
export function createConfig(config: UserConfig): UserConfig;
export function createConfig(config: UserConfig | UserConfig[]): UserConfig | UserConfig[] {
    if (Array.isArray(config)) {
        return defineConfig(config.map((c) => ({ ...defaultConfig, ...c })));
    }
    return defineConfig({ ...defaultConfig, ...config });
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
export function deps(deps: UserConfig['deps']): UserConfig {
    return {
        deps: { ...defaultDeps, ...deps },
    };
}
