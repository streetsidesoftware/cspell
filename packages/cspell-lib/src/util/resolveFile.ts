import * as fs from 'fs';
import * as path from 'path';
import resolveFrom from 'resolve-from';
import * as os from 'os';
import resolveGlobal from 'resolve-global';

export interface ResolveFileResult {
    filename: string;
    relativeTo: string | undefined;
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
    const steps: { filename: string; fn: (f: string, r: string) => ResolveFileResult }[] = [
        { filename: filename, fn: tryNodeResolve },
        { filename: path.resolve(relativeTo, filename), fn: tryResolveExists },
        { filename: path.resolve(filename), fn: tryResolveExists },
        { filename: filename, fn: tryResolveFrom },
        { filename: filename.replace(testNodeModules, ''), fn: tryResolveFrom },
        { filename: filename, fn: tryResolveGlobal },
    ];

    for (const step of steps) {
        const r = step.fn(step.filename, relativeTo);
        if (r.found) return r;
    }
    return { filename: path.resolve(relativeTo, filename), relativeTo, found: false };
}

function tryNodeResolve(filename: string, relativeTo: string): ResolveFileResult {
    try {
        const r = require.resolve(filename, { paths: [path.resolve(relativeTo)] });
        return { filename: r, relativeTo, found: true };
    } catch (_) {
        return { filename, relativeTo, found: false };
    }
}

function tryResolveGlobal(filename: string): ResolveFileResult {
    const r = resolveGlobal.silent(filename);
    return { filename: r || filename, relativeTo: undefined, found: !!r };
}

function tryResolveExists(filename: string): ResolveFileResult {
    return { filename, relativeTo: undefined, found: fs.existsSync(filename) };
}

function tryResolveFrom(filename: string, relativeTo: string): ResolveFileResult {
    try {
        return { filename: resolveFrom(relativeTo, filename), relativeTo, found: true };
    } catch (error) {
        // Failed to resolve a relative module request
        return { filename: filename, relativeTo, found: false };
    }
}
