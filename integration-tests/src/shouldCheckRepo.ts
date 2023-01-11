import type { Repository } from './configDef';

export interface ShouldCheckOptions {
    exclude: string[];
    patterns: string[];
}

export function shouldCheckRepo(rep: Repository, options: ShouldCheckOptions): boolean {
    const { patterns, exclude } = options;
    const path = rep.path;
    const matchesPattern = patterns.reduce((a, p) => a || path.includes(p), !patterns.length);
    const excluded = exclude.reduce((a, p) => a || path.includes(p), false);
    return !excluded && matchesPattern;
}
