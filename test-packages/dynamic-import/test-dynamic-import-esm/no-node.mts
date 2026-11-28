// Type-checked by `check-no-node-types.mjs`: the published types must work without `@types/node`.
export type CspellDynamicImport = typeof import('@cspell/dynamic-import');
export type CspellDynamicImportCjs = typeof import('@cspell/dynamic-import', {
    with: { 'resolution-mode': 'require' },
});
