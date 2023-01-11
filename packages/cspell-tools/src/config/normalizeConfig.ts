import * as path from 'path';
import type { RunConfig } from '.';

type CosmiconfigResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    filepath: string;
    isEmpty?: boolean | undefined;
} | null;

export function normalizeConfig(cfg: CosmiconfigResult): CosmiconfigResult {
    if (!cfg) return cfg;
    const dir = path.dirname(cfg.filepath);
    const config = cfg.config as Partial<RunConfig>;
    const result: RunConfig = { ...config, rootDir: path.resolve(dir, config.rootDir || '.') };

    return {
        config: result,
        filepath: cfg.filepath,
    };
}
