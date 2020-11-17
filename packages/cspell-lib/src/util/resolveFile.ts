import * as fs from 'fs';
import * as path from 'path';
import resolveFrom from 'resolve-from';

export interface ResolveFileResult {
    filename: string;
    found: boolean;
}

const testNodeModules = /^node_modules\//;

export function resolveFile(filename: string, relativeTo: string): ResolveFileResult {
    const methodResolveFrom = (filename: string) => tryResolveFrom(filename, relativeTo);
    const steps: { filename: string; fn: (f: string) => ResolveFileResult }[] = [
        { filename: path.resolve(relativeTo, filename), fn: tryResolveExists },
        { filename: path.resolve(filename), fn: tryResolveExists },
        { filename: filename, fn: methodResolveFrom },
        { filename: filename.replace(testNodeModules, ''), fn: methodResolveFrom },
        { filename: './' + (path.sep === '/' ? filename : filename.split(path.sep).join('/')), fn: methodResolveFrom },
    ];

    for (const step of steps) {
        const r = step.fn(step.filename);
        if (r.found) return r;
    }
    return { filename, found: false };
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
