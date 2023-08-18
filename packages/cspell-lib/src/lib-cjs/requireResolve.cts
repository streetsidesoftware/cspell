import { npm, yarn } from 'global-dirs';

export function resolveGlobal(modulesName: string): string | undefined {
    const paths = [npm.packages, yarn.packages];
    return requireResolve(modulesName, paths);
}

export function requireResolve(filename: string, paths?: string[]): string | undefined {
    try {
        return require.resolve(filename, paths ? { paths } : undefined);
    } catch (e) {
        return undefined;
    }
}
