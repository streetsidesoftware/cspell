import { glob } from 'glob';

interface Options {
    cwd?: string | URL;
    nodir?: boolean; // cspell:ignore nodir
}

export function globP(pattern: string | string[], options?: Options): Promise<string[]> {
    // Convert windows separators.
    const globs = (Array.isArray(pattern) ? pattern : [pattern]).map((pattern) => pattern.replace(/\\/g, '/'));
    return glob(globs, options);
}
