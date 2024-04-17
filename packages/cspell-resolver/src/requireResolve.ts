import globalDirectory from 'global-directory';

export function resolveGlobal(modulesName: string): string | undefined {
    const paths = [globalDirectory.npm.packages, globalDirectory.yarn.packages];
    return requireResolve(modulesName, paths);
}

export function requireResolve(filename: string, paths?: string[]): string | undefined {
    try {
        return require.resolve(filename, paths ? { paths } : undefined);
    } catch (_) {
        return undefined;
    }
}
