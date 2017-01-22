import { Sequence } from 'gensequence';
import { CSpellUserSettings } from './CSpellSettingsDef';
import { SpellingDictionary } from './SpellingDictionary';
export declare type CSpellUserSettingsKeys = keyof CSpellUserSettings;
export declare function getInDocumentSettings(text: string): CSpellUserSettings;
export declare function getWordsDictionaryFromDoc(text: string): SpellingDictionary;
export declare function getIgnoreWordsFromDocument(text: string): string[];
export declare function getIgnoreWordsSetFromDocument(text: string): Set<string>;
export declare function getIgnoreRegExpFromDocument(text: string): (string | RegExp)[];
/**
 * These internal functions are used exposed for unit testing.
 */
export declare const internal: {
    getPossibleInDocSettings: (text: string) => Sequence<RegExpExecArray>;
    getWordsFromDocument: (text: string) => string[];
    parseWords: (match: string) => CSpellUserSettings;
    parseCompoundWords: (match: string) => CSpellUserSettings;
    parseIgnoreRegExp: (match: string) => CSpellUserSettings;
    parseIgnoreWords: (match: string) => CSpellUserSettings;
};
