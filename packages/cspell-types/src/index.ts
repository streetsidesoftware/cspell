// Using old-style of `type` exports because the new style breaks some integrations.
export { ConfigFields } from './configFields';
export type { CSpellUserSettingsFields } from './configFields';
export * from './CSpellReporter';
export * from './CSpellSettingsDef';
export type { CharacterSet, CharacterSetCosts, DictionaryInformation, EditCosts } from './DictionaryInformation';
export type { Feature, Features } from './features';
export type { ParsedText, Parser, ParseResult, ParserName, ParserOptions } from './Parser';
export type { SuggestionCostMapDef, SuggestionCostsDefs } from './suggestionCostsDef';
export type { TextMap } from './TextMap';
export type { TextDocumentOffset, TextOffset } from './TextOffset';
