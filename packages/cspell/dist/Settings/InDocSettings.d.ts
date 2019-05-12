import { Sequence } from 'gensequence';
import { CSpellUserSettings } from './CSpellSettingsDef';
export declare type CSpellUserSettingsKeys = keyof CSpellUserSettings;
export declare function getInDocumentSettings(text: string): CSpellUserSettings;
declare function parseCompoundWords(match: string): CSpellUserSettings;
declare function parseWords(match: string): CSpellUserSettings;
declare function parseIgnoreWords(match: string): CSpellUserSettings;
declare function parseIgnoreRegExp(match: string): CSpellUserSettings;
declare function getPossibleInDocSettings(text: string): Sequence<RegExpExecArray>;
declare function getWordsFromDocument(text: string): string[];
export declare function getIgnoreWordsFromDocument(text: string): string[];
export declare function getIgnoreRegExpFromDocument(text: string): (string | RegExp)[];
/**
 * These internal functions are used exposed for unit testing.
 */
export declare const internal: {
    getPossibleInDocSettings: typeof getPossibleInDocSettings;
    getWordsFromDocument: typeof getWordsFromDocument;
    parseWords: typeof parseWords;
    parseCompoundWords: typeof parseCompoundWords;
    parseIgnoreRegExp: typeof parseIgnoreRegExp;
    parseIgnoreWords: typeof parseIgnoreWords;
};
export {};
