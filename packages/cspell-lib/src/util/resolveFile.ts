import * as fs from 'fs';
import * as path from 'path';
import resolveFrom from 'resolve-from';
import * as os from 'os';

export interface ResolveFileResult {
    filename: string;
    found: boolean;
}

const testNodeModules = /^node_modules\//;

/**
 * Resolve filename to absolute paths.
 * It tries to look for local files as well as node_modules
 * @param filename an absolute path, relative path, `~` path, or a node_module.
 * @param relativeTo absolute path
 */
export function resolveFile(filename: string, relativeTo: string): ResolveFileResult {
    filename = filename.replace(/^~/, os.homedir());
    const methodResolveFrom = (filename: string) => tryResolveFrom(filename, relativeTo);
    const steps: { filename: string; fn: (f: string) => ResolveFileResult }[] = [
        { filename: path.resolve(relativeTo, filename), fn: tryResolveExists },
        { filename: path.resolve(filename), fn: tryResolveExists },
        { filename: filename, fn: methodResolveFrom },
        { filename: filename.replace(testNodeModules, ''), fn: methodResolveFrom },
    ];

    for (const step of steps) {
        const r = step.fn(step.filename);
        if (r.found) return r;
    }
    return { filename: path.resolve(relativeTo, filename), found: false };
}

function tryResolveExists(filename: string): ResolveFileResult {
    return { filename, found: fs.existsSync(filename) };
}

function tryResolveFrom(filename: string, relativeTo: string): ResolveFileResult {
    try {
        return { filename: resolveFrom(relativeTo, filename), found: true };
    } catch (error) {
        // Failed to resolve a relative module request
        return { filename: filename, found: false };
    }
}
