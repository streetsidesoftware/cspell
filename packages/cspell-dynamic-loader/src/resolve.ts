import * as OS from 'os';
import * as Path from 'path';

interface ResolveResultBase {
    moduleId: string;
    path: string | undefined;
    relativeToPath: string;
    found: boolean;
    error: undefined | unknown;
}

export interface ResolveResultFound extends ResolveResultBase {
    path: string;
    relativeToPath: string;
    found: true;
    error: undefined;
}

export interface ResolveResultNotFound extends ResolveResultBase {
    path: undefined;
    relativeToPath: string;
    found: false;
    error: unknown;
}

export type ResolveResult = ResolveResultFound | ResolveResultNotFound;

export function resolveModuleSync(moduleId: string, relativeToPath: string): ResolveResult {
    const options = {
        paths: possiblePaths(relativeToPath),
    };
    try {
        return { moduleId, path: require.resolve(moduleId, options), relativeToPath, found: true, error: undefined };
    } catch (error) {
        // Failed to resolve a relative module request
        return { moduleId, path: undefined, relativeToPath, found: false, error };
    }
}

export function possiblePaths(path: string): string[] {
    const paths: string[] = [];
    const homeDir = OS.homedir();
    let last = '';
    while (path && path !== last) {
        paths.push(path);
        last = path;
        if (path !== homeDir) break;
        path = Path.dirname(path);
    }
    return paths;
}
