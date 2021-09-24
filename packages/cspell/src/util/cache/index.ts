import path from 'path';
import { CSpellApplicationConfiguration } from '../../CSpellApplicationConfiguration';
import { ConfigInfo } from '../../fileHelper';
import type { CSpellLintResultCache } from './CSpellLintResultCache';
import { DummyCache } from './DummyCache';
import { FileCache } from './FileCache';

// cspell:word cspellcache
export const DEFAULT_CACHE_LOCATION = '.cspellcache';

export function createCache(cfg: CSpellApplicationConfiguration, configInfo: ConfigInfo): CSpellLintResultCache {
    const { cache, cacheLocation = DEFAULT_CACHE_LOCATION } = cfg.options;
    return cache ? new FileCache(path.resolve(cfg.root, cacheLocation), configInfo) : new DummyCache();
}
