import type { CSpellUserSettings } from '@cspell/cspell-types';
import { genSequence, Sequence } from 'gensequence';
import * as Text from '../util/text';
import { clean } from '../util/util';
import { mergeInDocSettings } from './CSpellSettingsServer';

// cspell:ignore gimuy
const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExInFileSettings = [/(?:spell-?checker|c?spell)::?(.*)/gi, /(LocalWords:?.*)/g];

export type CSpellUserSettingsKeys = keyof CSpellUserSettings;

const EmptyWords: string[] = [];
Object.freeze(EmptyWords);

export function getInDocumentSettings(text: string): CSpellUserSettings {
    const settings = getPossibleInDocSettings(text)
        .concatMap((a) => parseSettingMatch(a))
        .reduce(
            (s, setting) => {
                return mergeInDocSettings(s, setting);
            },
            { id: 'in-doc-settings' } as CSpellUserSettings
        );
    // console.log('InDocSettings: %o', settings);
    return settings;
}

function parseSettingMatch(matchArray: RegExpMatchArray): CSpellUserSettings[] {
    const [, match = ''] = matchArray;
    const possibleSetting = match.trim();
    const settingParsers: [RegExp, (m: string) => CSpellUserSettings][] = [
        [/^(?:enable|disable)(?:allow)?CompoundWords/i, parseCompoundWords],
        [/^(?:enable|disable)CaseSensitive/i, parseCaseSensitive],
        [/^words?\s/i, parseWords],
        [/^ignore(?:words?)?\s/i, parseIgnoreWords],
        [/^ignore_?Reg_?Exp\s+.+$/i, parseIgnoreRegExp],
        [/^include_?Reg_?Exp\s+.+$/i, parseIncludeRegExp],
        [/^locale?\s/i, parseLocale],
        [/^language\s/i, parseLocale],
        [/^dictionaries\s/i, parseDictionaries],
        [/^LocalWords:/, (w) => parseWords(w.replace(/LocalWords:?/gi, ' '))],
    ];

    return settingParsers
        .filter(([regex]) => regex.test(possibleSetting))
        .map(([, fn]) => fn)
        .map((fn) => fn(possibleSetting));
}

function parseCompoundWords(match: string): CSpellUserSettings {
    const allowCompoundWords = /enable/i.test(match);
    return { id: 'in-doc-allowCompoundWords', allowCompoundWords };
}

function parseCaseSensitive(match: string): CSpellUserSettings {
    const caseSensitive = /enable/i.test(match);
    return { id: 'in-doc-caseSensitive', caseSensitive };
}

function parseWords(match: string): CSpellUserSettings {
    const words = match.split(/[,\s]+/g).slice(1);
    return { id: 'in-doc-words', words };
}

function parseLocale(match: string): CSpellUserSettings {
    const parts = match.trim().split(/[\s,]+/);
    const language = parts.slice(1).join(',');
    return language ? { id: 'in-doc-local', language } : {};
}

function parseIgnoreWords(match: string): CSpellUserSettings {
    const wordsSetting = parseWords(match);
    return clean({ id: 'in-doc-ignore', ignoreWords: wordsSetting.words });
}

function parseRegEx(match: string): string[] {
    const patterns = [match.replace(/^[^\s]+\s+/, '')].map((a) => {
        const m = a.match(regExMatchRegEx);
        if (m && m[0]) {
            return m[0];
        }
        return a.replace(/((?:[^\s]|\\ )+).*/, '$1');
    });
    return patterns;
}

function parseIgnoreRegExp(match: string): CSpellUserSettings {
    const ignoreRegExpList = parseRegEx(match);
    return { id: 'in-doc-ignoreRegExp', ignoreRegExpList };
}

function parseIncludeRegExp(match: string): CSpellUserSettings {
    const includeRegExpList = parseRegEx(match);
    return { id: 'in-doc-includeRegExp', includeRegExpList };
}

function parseDictionaries(match: string): CSpellUserSettings {
    const dictionaries = match.split(/[,\s]+/g).slice(1);
    return { id: 'in-doc-dictionaries', dictionaries };
}

function getPossibleInDocSettings(text: string): Sequence<RegExpExecArray> {
    return genSequence(regExInFileSettings).concatMap((regexp) => Text.match(regexp, text));
}

function getWordsFromDocument(text: string): string[] {
    const { words = EmptyWords } = getInDocumentSettings(text);
    return words;
}

export function getIgnoreWordsFromDocument(text: string): string[] {
    const { ignoreWords = EmptyWords } = getInDocumentSettings(text);
    return ignoreWords;
}

export function getIgnoreRegExpFromDocument(text: string): (string | RegExp)[] {
    const { ignoreRegExpList = [] } = getInDocumentSettings(text);
    return ignoreRegExpList;
}

/**
 * These internal functions are used exposed for unit testing.
 */
export const internal = {
    getPossibleInDocSettings,
    getWordsFromDocument,
    parseWords,
    parseCompoundWords,
    parseIgnoreRegExp,
    parseIgnoreWords,
};
