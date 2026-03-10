import { DepsConfig, UserConfig, UserConfig as UserConfig$1, defineConfig } from "tsdown";

//#region config.d.ts
declare const defaultDeps: DepsConfig;
declare const defaultConfig: UserConfig$1;
declare function createConfig(config: UserConfig$1[]): UserConfig$1[];
declare function createConfig(config: UserConfig$1): UserConfig$1;
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
declare function deps(deps: UserConfig$1['deps']): UserConfig$1;
//#endregion
export { type UserConfig, createConfig, defaultConfig, defaultDeps, defineConfig, deps };