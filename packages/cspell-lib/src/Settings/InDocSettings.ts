import { opAppend, opFilter, opMap, pipeSync } from '@cspell/cspell-pipe';
import type { CSpellUserSettings } from '@cspell/cspell-types';
import { genSequence, Sequence } from 'gensequence';
import { createSpellingDictionary } from '../SpellingDictionary';
import * as Text from '../util/text';
import { clean, isDefined } from '../util/util';
import { mergeInDocSettings } from './CSpellSettingsServer';

// cspell:ignore gimuy
const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExCSpellInDocDirective = /(?:spell-?checker|c?spell)::?(.*)/gi;
const regExCSpellDirectiveKey = /(?<=(?:spell-?checker|c?spell)::?)(?!:)(.*)/i;
const regExInFileSettings = [regExCSpellInDocDirective, /(LocalWords:?.*)/g];

export type CSpellUserSettingsKeys = keyof CSpellUserSettings;

const officialDirectives = [
    'enable',
    'disable',
    'disable-line',
    'disable-next',
    'disable-next-line',
    'word',
    'words',
    'ignore',
    'ignoreWord',
    'ignoreWords',
    'includeRegExp',
    'ignoreRegExp',
    'locale',
    'language',
    'dictionaries',
    'enableCompoundWords',
    'enableAllowCompoundWords',
    'disableCompoundWords',
    'disableAllowCompoundWords',
    'enableCaseSensitive',
    'disableCaseSensitive',
];

const preferredDirectives = [
    'enable',
    'disable',
    'disable-line',
    'disable-next-line',
    'words',
    'ignore',
    'locale',
    'dictionaries',
    'enableCaseSensitive',
    'disableCaseSensitive',
];

const allDirectives = new Set(preferredDirectives.concat(officialDirectives));

const dictInDocSettings = createSpellingDictionary(allDirectives, 'Directives', 'Directive List', {
    supportNonStrictSearches: false,
});

const EmptyWords: string[] = [];
Object.freeze(EmptyWords);

export interface DirectiveIssue {
    /**
     * the start and end offsets within the document of the issue.
     */
    range: [start: number, end: number];
    /**
     * The text causing the issue.
     */
    text: string;
    message: string;
    suggestions: string[];
}

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

export function validateInDocumentSettings(docText: string, _settings: CSpellUserSettings): Iterable<DirectiveIssue> {
    return pipeSync(getPossibleInDocSettings(docText), opMap(parseSettingMatchValidation), opFilter(isDefined));
}

const settingParsers: readonly (readonly [RegExp, (m: string) => CSpellUserSettings])[] = [
    [/^(?:enable|disable)(?:allow)?CompoundWords\b/i, parseCompoundWords],
    [/^(?:enable|disable)CaseSensitive\b/i, parseCaseSensitive],
    [/^enable\b(?!-)/i, parseEnable],
    [/^disable(-line|-next(-line)?)?\b(?!-)/i, parseDisable],
    [/^words?\s/i, parseWords],
    [/^ignore(?:words?)?\s/i, parseIgnoreWords],
    [/^ignore_?Reg_?Exp\s+.+$/i, parseIgnoreRegExp],
    [/^include_?Reg_?Exp\s+.+$/i, parseIncludeRegExp],
    [/^locale?\s/i, parseLocale],
    [/^language\s/i, parseLocale],
    [/^dictionaries\s/i, parseDictionaries],
    [/^LocalWords:/, (w) => parseWords(w.replace(/LocalWords:?/gi, ' '))],
] as const;

export const regExSpellingGuardBlock =
    /(\bc?spell(?:-?checker)?::?)\s*disable(?!-line|-next)\b[\s\S]*?((?:\1\s*enable\b)|$)/gi;
export const regExSpellingGuardNext = /\bc?spell(?:-?checker)?::?\s*disable-next\b.*\s\s?.*/gi;
export const regExSpellingGuardLine = /^.*\bc?spell(?:-?checker)?::?\s*disable-line\b.*/gim;

const issueMessages = {
    unknownDirective: 'Unknown CSpell directive',
} as const;

function parseSettingMatchValidation(matchArray: RegExpMatchArray): DirectiveIssue | undefined {
    const [fullMatch = ''] = matchArray;

    const directiveMatch = fullMatch.match(regExCSpellDirectiveKey);
    if (!directiveMatch) return undefined;

    const match = directiveMatch[1];
    const possibleSetting = match.trim();
    if (!possibleSetting) return undefined;

    const start = (matchArray.index || 0) + (directiveMatch.index || 0) + (match.length - match.trimStart().length);
    const text = possibleSetting.replace(/^([-\w]+)?.*/, '$1');
    const end = start + text.length;

    if (!text) return undefined;

    const matchingParsers = settingParsers.filter(([regex]) => regex.test(possibleSetting));
    if (matchingParsers.length > 0) return undefined;

    // No matches were found, let make some suggestions.
    const dictSugs = dictInDocSettings.suggest(text, { ignoreCase: false }).map((sug) => sug.word);
    const sugs = new Set(pipeSync(dictSugs, opAppend(allDirectives)));
    const suggestions = [...sugs].slice(0, 8);

    const issue: DirectiveIssue = {
        range: [start, end],
        text,
        message: issueMessages.unknownDirective,
        suggestions,
    };

    return issue;
}

function parseSettingMatch(matchArray: RegExpMatchArray): CSpellUserSettings[] {
    const [, match = ''] = matchArray;
    const possibleSetting = match.trim();

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

function parseEnable(_match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return {};
}

function parseDisable(_match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return {};
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
