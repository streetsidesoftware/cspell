import * as path from 'path';
import { isFilePath, isFileSource } from '../compiler/configUtils';
import { RunConfig, Target, DictionarySource } from '.';
import { createNormalizer } from '../compiler/wordListParser';

type CosmiconfigResult = {
    config: any;
    filepath: string;
    isEmpty?: boolean | undefined;
} | null;

// interface ConfigNormalizer {
//     normalize(cfg: CosmiconfigResult): CosmiconfigResult;
// }

// createNormalizer()

export function normalizeConfig(cfg: CosmiconfigResult): CosmiconfigResult {
    if (!cfg) return cfg;
    const dir = path.dirname(cfg.filepath);
    const config = cfg.config as Partial<RunConfig>;

    const targets: Target[] = normalizeTargets(config.targets, dir);

    const result = { ...config, targets };

    return {
        config: result,
        filepath: cfg.filepath,
    };
}

function normalizeTargets(targets: Target[] | undefined, dir: string): Target[] {
    if (!targets) return [];

    function normalizeTarget(target: Target): Target {
        return {
            ...target,
            targetDirectory: path.resolve(dir, target.targetDirectory || '.'),
            sources: normalizeSources(target.sources, dir),
        };
    }

    return targets.map(normalizeTarget);
}

function normalizeSources(sources: DictionarySource[] | undefined, dir: string): DictionarySource[] {
    if (!sources) return [];

    function normalizeSource(source: DictionarySource): DictionarySource {
        if (!source) return source;

        if (isFilePath(source)) {
            return path.resolve(dir, source);
        }
        if (isFileSource(source)) {
            return { ...source, filename: path.resolve(dir, source.filename) };
        }
        return { ...source, listFile: path.resolve(dir, source.listFile) };
    }

    return sources.map(normalizeSource).filter((a) => !!a);
}
