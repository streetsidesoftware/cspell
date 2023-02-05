/**
 * Thunk Layer for `import` to allow dynamic imports.
 * @param {string} module - name of module to load
 * @returns
 */
export function dImport(module) {
    return import(module.toString());
}
