import { opAppend, opFilter, opFlatten, opMap, pipeSync } from '@cspell/cspell-pipe/sync';
import type { CSpellUserSettings, DictionaryDefinitionInline } from '@cspell/cspell-types';

import type { ExtendedSuggestion } from '../Models/Suggestion.js';
import { createSpellingDictionary } from '../SpellingDictionary/index.js';
import * as Text from '../util/text.js';
import { clean, isDefined } from '../util/util.js';

// cspell:ignore gimuy
const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExCSpellInDocDirective = /\b(?:spell-?checker|c?spell)::?(.*)/gi;
const regExCSpellDirectiveKey = /(?<=\b(?:spell-?checker|c?spell)::?)(?!:)(.*)/i;
const regExInFileSettings = [regExCSpellInDocDirective, /\b(LocalWords:?.*)/g];

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
    'ignore-word',
    'ignore-words',
    'includeRegExp',
    'ignoreRegExp',
    'local', // Do not suggest.
    'locale',
    'language',
    'dictionaries',
    'dictionary',
    'forbid',
    'forbidWord',
    'forbid-word',
    'flag',
    'flagWord',
    'flag-word',
    'enableCompoundWords',
    'enableAllowCompoundWords',
    'disableCompoundWords',
    'disableAllowCompoundWords',
    'enableCaseSensitive',
    'disableCaseSensitive',
];

const noSuggestDirectives = new Set(['local']);

const preferredDirectives = [
    'enable',
    'disable',
    'disable-line',
    'disable-next-line',
    'words',
    'ignore',
    'forbid',
    'locale',
    'dictionary',
    'dictionaries',
    'enableCaseSensitive',
    'disableCaseSensitive',
];

const allDirectives = new Set([...preferredDirectives, ...officialDirectives]);
const allDirectiveSuggestions: ExtendedSuggestion[] = [
    ...pipeSync(
        allDirectives,
        opMap((word) => ({ word })),
    ),
];

const dictInDocSettings = createSpellingDictionary(allDirectives, 'Directives', 'Directive List', {
    supportNonStrictSearches: false,
});

const EmptyWords: string[] = [];
Object.freeze(EmptyWords);

const staticInDocumentDictionaryName = `[in-document-dict]`;

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
    suggestionsEx: ExtendedSuggestion[];
}

function collectInDocumentDirectives(text: string): DirectiveMatchWithParser[] {
    const dirs = [...getPossibleInDocSettings(text)].flatMap((a) => associateDirectivesWithParsers(a));
    return dirs;
}

const baseInDocSettings: CSpellUserSettings = { id: 'in-doc-settings' };
Object.freeze(baseInDocSettings);

export function getInDocumentSettings(text: string): CSpellUserSettings {
    const found = collectInDocumentDirectives(text);
    if (!found.length) return { ...baseInDocSettings };
    const collectedSettings = reducePossibleMatchesToSettings(found, { ...baseInDocSettings });
    const {
        words,
        flagWords,
        ignoreWords,
        suggestWords,
        dictionaries = [],
        dictionaryDefinitions = [],
        ...rest
    } = collectedSettings;
    const dict: DictionaryDefinitionInline | undefined =
        (words || flagWords || ignoreWords || suggestWords) &&
        clean({
            name: staticInDocumentDictionaryName,
            words,
            flagWords,
            ignoreWords,
            suggestWords,
        });

    const dictSettings = dict
        ? {
              dictionaries: [...dictionaries, staticInDocumentDictionaryName],
              dictionaryDefinitions: [...dictionaryDefinitions, dict],
          }
        : clean({
              dictionaries: dictionaries.length ? dictionaries : undefined,
              dictionaryDefinitions: dictionaryDefinitions.length ? dictionaryDefinitions : undefined,
          });

    const settings = {
        ...rest,
        ...dictSettings,
    };
    return settings;
}

export function validateInDocumentSettings(docText: string, _settings: CSpellUserSettings): Iterable<DirectiveIssue> {
    return pipeSync(getPossibleInDocSettings(docText), opMap(parseSettingMatchValidation), opFilter(isDefined));
}

interface PossibleMatch {
    /** The full directive text till the end of the line */
    fullDirective: string;
    /** Offset of the directive */
    offset: number;
    /** the partial directive, missing the CSpell prefix. */
    match: string;
}

type Directive =
    | 'CompoundWords'
    | 'CaseSensitive'
    | 'Enable'
    | 'Disable'
    | 'Words'
    | 'Ignore'
    | 'Flag'
    | 'IgnoreRegExp'
    | 'IncludeRegExp'
    | 'Locale'
    | 'Dictionaries';

type ReducerFn = (acc: CSpellUserSettings, match: string) => CSpellUserSettings;

interface DirectiveMatchWithParser extends PossibleMatch {
    directive: Directive;
    fn: ReducerFn;
}

const settingParsers: readonly (readonly [RegExp, ReducerFn, Directive])[] = [
    [/^(?:enable|disable)(?:allow)?CompoundWords\b(?!-)/i, parseCompoundWords, 'CompoundWords'],
    [/^(?:enable|disable)CaseSensitive\b(?!-)/i, parseCaseSensitive, 'CaseSensitive'],
    [/^enable\b(?!-)/i, parseEnable, 'Enable'],
    [/^disable(-line|-next(-line)?)?\b(?!-)/i, parseDisable, 'Disable'],
    [/^words?\b(?!-)/i, parseWords, 'Words'],
    [/^ignore(?:-?words?)?\b(?!-)/i, parseIgnoreWords, 'Ignore'],
    [/^(?:flag|forbid)(?:-?words?)?\b(?!-)/i, parseFlagWords, 'Flag'],
    [/^ignore_?Reg_?Exp\s+.+$/i, parseIgnoreRegExp, 'IgnoreRegExp'],
    [/^include_?Reg_?Exp\s+.+$/i, parseIncludeRegExp, 'IncludeRegExp'],
    [/^locale?\b(?!-)/i, parseLocale, 'Locale'],
    [/^language\s\b(?!-)/i, parseLocale, 'Locale'],
    [/^dictionar(?:y|ies)\b(?!-)/i, parseDictionaries, 'Dictionaries'], // cspell:disable-line
    [/^LocalWords:/, (acc, m) => reduceWordList(acc, m.replaceAll(/^LocalWords:?/gi, ' '), 'words'), 'Words'],
] as const;

export const regExSpellingGuardBlock =
    /(\bc?spell(?:-?checker)?::?)\s*disable(?!-line|-next)\b[\s\S]*?((?:\1\s*enable\b)|$)/gi;
export const regExSpellingGuardNext = /\bc?spell(?:-?checker)?::?\s*disable-next\b.*\s\s?.*/gi;
export const regExSpellingGuardLine = /^.*\bc?spell(?:-?checker)?::?\s*disable-line\b.*/gim;

const issueMessages = {
    unknownDirective: 'Unknown CSpell directive',
} as const;

function parseSettingMatchValidation(possibleMatch: PossibleMatch): DirectiveIssue | undefined {
    const { fullDirective, offset } = possibleMatch;

    const directiveMatch = fullDirective.match(regExCSpellDirectiveKey);
    if (!directiveMatch) return undefined;

    const match = directiveMatch[1];
    const possibleSetting = match.trim();
    if (!possibleSetting) return undefined;

    const start = offset + (directiveMatch.index || 0) + (match.length - match.trimStart().length);
    const text = possibleSetting.replace(/^([-\w]+)?.*/, '$1');
    const end = start + text.length;

    if (!text) return undefined;

    const matchingParsers = settingParsers.filter(([regex]) => regex.test(possibleSetting));
    if (matchingParsers.length > 0) return undefined;

    // No matches were found, let make some suggestions.
    const dictSugs = dictInDocSettings
        .suggest(text, { ignoreCase: false })
        .map(({ word, isPreferred }) => (isPreferred ? { word, isPreferred } : { word }))
        .filter((a) => !noSuggestDirectives.has(a.word));
    const sugs = pipeSync(dictSugs, opAppend(allDirectiveSuggestions), filterUniqueSuggestions);
    const suggestionsEx = [...sugs].slice(0, 8);
    const suggestions = suggestionsEx.map((s) => s.word);

    const issue: DirectiveIssue = {
        range: [start, end],
        text,
        message: issueMessages.unknownDirective,
        suggestions,
        suggestionsEx,
    };

    return issue;
}

function* filterUniqueSuggestions(sugs: Iterable<ExtendedSuggestion>): Iterable<ExtendedSuggestion> {
    const map = new Map<string, ExtendedSuggestion>();

    for (const sug of sugs) {
        const existing = map.get(sug.word);
        if (existing && sug.isPreferred) {
            existing.isPreferred = true;
        }
        yield sug;
    }
}

function associateDirectivesWithParsers(possibleMatch: PossibleMatch): DirectiveMatchWithParser[] {
    const { match } = possibleMatch;
    const possibleSetting = match.trim();

    return settingParsers
        .filter(([regex]) => regex.test(possibleSetting))
        .map(([, fn, directive]) => ({ ...possibleMatch, directive, fn }));
}

function mergeDirectiveIntoSettings(
    settings: CSpellUserSettings,
    directive: DirectiveMatchWithParser,
): CSpellUserSettings {
    return directive.fn(settings, directive.match);
}

function reducePossibleMatchesToSettings(
    directives: DirectiveMatchWithParser[],
    settings: CSpellUserSettings,
): CSpellUserSettings {
    for (const directive of directives) {
        settings = mergeDirectiveIntoSettings(settings, directive);
    }
    return settings;
}

function parseCompoundWords(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    acc.allowCompoundWords = /enable/i.test(match);
    return acc;
}

function parseCaseSensitive(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    acc.caseSensitive = /enable/i.test(match);
    return acc;
}

function splitWords(match: string): string[] {
    return match
        .split(/[,\s;]+/g)
        .slice(1)
        .filter((a) => !!a);
}

function mergeList<T>(a: T[] | undefined, b: T[]): T[] {
    if (!a) return b;
    if (!b) return a;
    return [...a, ...b];
}

function reduceWordList(
    acc: CSpellUserSettings,
    match: string,
    key: 'words' | 'ignoreWords' | 'flagWords',
): CSpellUserSettings {
    const words = splitWords(match);
    if (words.length) {
        acc[key] = mergeList(acc[key], words);
    }
    return acc;
}

function parseWords(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    return reduceWordList(acc, match, 'words');
}

function parseLocale(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    const parts = match.trim().split(/[\s,]+/);
    const language = parts.slice(1).join(',');
    if (language) {
        acc.language = language;
    }
    return acc;
}

function parseIgnoreWords(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    return reduceWordList(acc, match, 'ignoreWords');
}

function parseFlagWords(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    return reduceWordList(acc, match, 'flagWords');
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

function parseIgnoreRegExp(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    const ignoreRegExpList = parseRegEx(match);
    if (ignoreRegExpList.length) {
        acc.ignoreRegExpList = mergeList(acc.ignoreRegExpList, ignoreRegExpList);
    }
    return acc;
}

function parseIncludeRegExp(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    const includeRegExpList = parseRegEx(match);
    if (includeRegExpList.length) {
        acc.includeRegExpList = mergeList(acc.includeRegExpList, includeRegExpList);
    }
    return acc;
}

function parseDictionaries(acc: CSpellUserSettings, match: string): CSpellUserSettings {
    const dictionaries = match.split(/[,\s]+/g).slice(1);
    if (dictionaries.length) {
        acc.dictionaries = mergeList(acc.dictionaries, dictionaries);
    }
    return acc;
}

function getPossibleInDocSettings(text: string): Iterable<PossibleMatch> {
    return pipeSync(
        regExInFileSettings,
        opMap((regexp) => Text.match(regexp, text)),
        opFlatten(),
        opMap((match) => ({ fullDirective: match[0], offset: match.index, match: match[1].trim() })),
    );
}

function getWordsFromDocument(text: string): string[] {
    const dict = extractInDocDictionary(getInDocumentSettings(text));
    return dict?.words || EmptyWords;
}

function parseEnable(acc: CSpellUserSettings, _match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return acc;
}

function parseDisable(acc: CSpellUserSettings, _match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return acc;
}

export function extractInDocDictionary(settings: CSpellUserSettings): DictionaryDefinitionInline | undefined {
    const inDocDicts = settings.dictionaryDefinitions?.filter((def) => def.name === staticInDocumentDictionaryName);
    const dict = inDocDicts?.[0] as DictionaryDefinitionInline;
    return dict;
}

export function getIgnoreWordsFromDocument(text: string): string[] {
    const dict = extractInDocDictionary(getInDocumentSettings(text));
    return dict?.ignoreWords || EmptyWords;
}

export function getIgnoreRegExpFromDocument(text: string): (string | RegExp)[] {
    const { ignoreRegExpList = [] } = getInDocumentSettings(text);
    return ignoreRegExpList;
}

/**
 * These internal functions are used exposed for unit testing.
 */
export const __internal = {
    collectInDocumentSettings: collectInDocumentDirectives,
    getPossibleInDocSettings,
    getWordsFromDocument,
    parseWords,
    parseCompoundWords,
    parseIgnoreRegExp,
    parseIgnoreWords,
    staticInDocumentDictionaryName,
};
