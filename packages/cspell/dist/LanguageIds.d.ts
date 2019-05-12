/**
 * The data for this file was constructed from:
 * ```
 * cd ~/projects/clones/vscode/extensions
 * find . -type f -iname package.json -exec pcregrep -M '(?:"id":.*)|(?:"extensions":[^\]]+)' {} \; > ~/projects/cspell/src/languageIds.txt`
 * ```
 */
export interface LanguageExtensionDefinition {
    id: string;
    extensions: string[];
}
export declare type LanguageExtensionDefinitions = LanguageExtensionDefinition[];
export declare type ExtensionToLanguageIdMap = Map<string, Set<string>>;
export declare const languageExtensionDefinitions: LanguageExtensionDefinitions;
export declare const languageIds: string[];
export declare function buildLanguageExtensionMap(defs: LanguageExtensionDefinitions): ExtensionToLanguageIdMap;
export declare function getLanguagesForExt(ext: string): string[];
