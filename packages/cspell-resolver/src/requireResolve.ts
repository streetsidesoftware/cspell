export function requireResolve(filename: string, paths?: string[]): string | undefined {
    try {
        // eslint-disable-next-line unicorn/prefer-module
        return require.resolve(filename, paths ? { paths } : undefined);
    } catch {
        return undefined;
    }
}
