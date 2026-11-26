// Type-checked by `check-no-node-types.mjs`: the published types must work without `@types/node`.
export type CspellCspellTypes = typeof import('@cspell/cspell-types');
export type CspellCspellTypesParser = typeof import('@cspell/cspell-types/Parser');
export type CspellCspellTypesCjs = typeof import('@cspell/cspell-types', { with: { 'resolution-mode': 'require' } });
export type CspellCspellTypesParserCjs = typeof import('@cspell/cspell-types/Parser', {
    with: { 'resolution-mode': 'require' },
});
