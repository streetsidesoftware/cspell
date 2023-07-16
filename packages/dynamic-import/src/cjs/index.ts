export async function dynamicImport<Module>(
    moduleName: string | URL,
    paths: string | URL | (string | URL)[] | undefined,
): Promise<Module> {
    const { dynamicImportFrom } = await import('../esm/dynamicImport.mjs');
    return dynamicImportFrom<Module>(moduleName, paths);
}
