// Using old-style of `type` exports because the new style breaks some integrations.
export { ConfigFields } from './configFields';
export type { CSpellUserSettingsFields } from './configFields';
export * from './CSpellReporter';
export * from './CSpellSettingsDef';
export type { SuggestionCostMapDef as WeightedMapDef } from './suggestionCostsDef';
export type { TextDocumentOffset, TextOffset } from './TextOffset';
