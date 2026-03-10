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

export function deps(deps: UserConfig['deps']): UserConfig {
    return {
        deps: { ...defaultDeps, ...deps },
    };
}
