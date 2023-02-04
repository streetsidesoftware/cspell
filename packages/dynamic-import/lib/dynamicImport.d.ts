/**
 * Dynamically import a module using `import`.
 * @param moduleName - name of module, or relative path.
 * @param searchPath - absolute search path, URL, or array of paths. Note: Paths must be absolute.
 *    The last path element of the URL will be removed if it does not end in a `/`.
 * @returns Promise resolving to the loaded module.
 */
export declare function dynamicImportFrom<T>(
    moduleName: string,
    searchPath: (string | URL)[] | string | URL
): Promise<T>;
