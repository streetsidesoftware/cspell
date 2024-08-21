import { opAppend, opFilter, opFlatten, opMap, pipeSync } from '@cspell/cspell-pipe/sync';
import type { CSpellUserSettings, DictionaryDefinitionInline } from '@cspell/cspell-types';

import type { ExtendedSuggestion } from '../Models/Suggestion.js';
import { createSpellingDictionary } from '../SpellingDictionary/index.js';
import * as Text from '../util/text.js';
import { clean, isDefined } from '../util/util.js';
import { mergeInDocSettings } from './CSpellSettingsServer.js';

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

function collectInDocumentSettings(text: string): CSpellUserSettings[] {
    const collectedSettings = [...getPossibleInDocSettings(text)].flatMap((a) => parseSettingMatchToSettings(a));
    return collectedSettings;
}

const baseInDocSettings: CSpellUserSettings = { id: 'in-doc-settings' };
Object.freeze(baseInDocSettings);

export function getInDocumentSettings(text: string): CSpellUserSettings {
    const found = collectInDocumentSettings(text);
    const collectedSettings = found.length ? mergeInDocSettings(baseInDocSettings, ...found) : baseInDocSettings;
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
    // console.log('InDocSettings: %o', settings);
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

type ParserFn = (match: string) => CSpellUserSettings;

interface DirectiveMatchWithParser extends PossibleMatch {
    directive: Directive;
    fn: ParserFn;
}

const settingParsers: readonly (readonly [RegExp, ParserFn, Directive])[] = [
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
    [/^LocalWords:/, (w) => parseWords(w.replaceAll(/^LocalWords:?/gi, ' ')), 'Words'],
] as const;

export const regExSpellingGuardBlock =
    /(\bc?spell(?:-?checker)?::?)\s*disable(?!-line|-next)\b[\s\S]*?((?:\1\s*enable\b)|$)/gi;
export const regExSpellingGuardNext = /\bc?spell(?:-?checker)?::?\s*disable-next\b.*\s\s?.*/gi;
export const regExSpellingGuardLine = /^.*\bc?spell(?:-?checker)?::?\s*disable-line\b.*/gim;

const emptySettings: CSpellUserSettings = Object.freeze({});

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

function parseSettingMatchToSettings(possibleMatch: PossibleMatch): CSpellUserSettings[] {
    return associateDirectivesWithParsers(possibleMatch).map((m) => m.fn(m.match));
}

function parseCompoundWords(match: string): CSpellUserSettings {
    const allowCompoundWords = /enable/i.test(match);
    return { allowCompoundWords };
}

function parseCaseSensitive(match: string): CSpellUserSettings {
    const caseSensitive = /enable/i.test(match);
    return { caseSensitive };
}

function parseWords(match: string): CSpellUserSettings {
    const words = match
        .split(/[,\s;]+/g)
        .slice(1)
        .filter((a) => !!a);
    return { words };
}

function parseLocale(match: string): CSpellUserSettings {
    const parts = match.trim().split(/[\s,]+/);
    const language = parts.slice(1).join(',');
    return language ? { language } : emptySettings;
}

function parseIgnoreWords(match: string): CSpellUserSettings {
    const wordsSetting = parseWords(match);
    const ignoreWords = wordsSetting.words;
    return ignoreWords && ignoreWords.length ? { ignoreWords } : emptySettings;
}

function parseFlagWords(match: string): CSpellUserSettings {
    const wordsSetting = parseWords(match);
    const flagWords = wordsSetting.words;
    return flagWords && flagWords.length ? { flagWords } : emptySettings;
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
    return { ignoreRegExpList };
}

function parseIncludeRegExp(match: string): CSpellUserSettings {
    const includeRegExpList = parseRegEx(match);
    return { includeRegExpList };
}

function parseDictionaries(match: string): CSpellUserSettings {
    const dictionaries = match.split(/[,\s]+/g).slice(1);
    return { dictionaries };
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

function parseEnable(_match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return {};
}

function parseDisable(_match: string): CSpellUserSettings {
    // Do nothing. Enable / Disable is handled in a different way.
    return {};
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
    collectInDocumentSettings,
    getPossibleInDocSettings,
    getWordsFromDocument,
    parseWords,
    parseCompoundWords,
    parseIgnoreRegExp,
    parseIgnoreWords,
    staticInDocumentDictionaryName,
};
