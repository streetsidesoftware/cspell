export async function dynamicImport<Module>(
    moduleName: string,
    paths: string | URL | (string | URL)[] | undefined
): Promise<Module> {
    const { dynamicImportFrom } = await import('./dynamicImport.mjs');
    return dynamicImportFrom<Module>(moduleName, paths);
}
