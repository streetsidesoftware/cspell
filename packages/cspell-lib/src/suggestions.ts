import type { CSpellSettings, LocaleId } from '@cspell/cspell-types';
import assert from 'assert';

import type { LanguageId } from './LanguageIds';
import { finalizeSettings, getDefaultSettings, getGlobalSettings, mergeSettings } from './Settings';
import { calcSettingsForLanguageId, isValidLocaleIntlFormat, normalizeLocaleIntl } from './Settings/LanguageSettings';
import type { FindOptions, SpellingDictionaryCollection, SuggestionResult, SuggestOptions } from './SpellingDictionary';
import { getDictionaryInternal, refreshDictionaryCache } from './SpellingDictionary';
import { createAutoResolveCache } from './util/AutoResolve';
import { memorizeLastCall } from './util/memorizeLastCall';
import * as util from './util/util';

interface SuggestedWordBase extends SuggestionResult {
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;

    /**
     * dictionary names
     */
    dictionaries: string[];
}
export interface SuggestedWord extends SuggestedWordBase {
    noSuggest: boolean;
    forbidden: boolean;
}

export interface SuggestionsForWordResult {
    word: string;
    suggestions: SuggestedWord[];
}

type FromSuggestOptions = Pick<SuggestOptions, 'numChanges' | 'numSuggestions' | 'includeTies'>;

export interface SuggestionOptions extends FromSuggestOptions {
    /**
     * languageId to use when determining file type.
     */
    languageId?: LanguageId | LanguageId[];

    /**
     * Locale to use.
     */
    locale?: LocaleId;

    /**
     * Strict case and accent checking
     * @default true
     */
    strict?: boolean;

    /**
     * List of dictionaries to use. If specified, only that list of dictionaries will be used.
     */
    dictionaries?: string[];

    /**
     * The number of suggestions to make.
     * @default 8
     */
    numSuggestions?: number | undefined;

    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     * @default 4
     */
    numChanges?: number | undefined;

    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default true
     */
    includeTies?: boolean | undefined;

    /**
     * By default we want to use the default configuration, but there are cases
     * where someone might not want that.
     * @default true
     */
    includeDefaultConfig?: boolean;
    // allowCompoundWords?: boolean; don't allow for now (maybe never)
}

const emptySuggestionOptions = Object.freeze({});
const emptyCSpellSettings = Object.freeze({});

export async function* suggestionsForWords(
    words: Iterable<string> | AsyncIterable<string>,
    options?: SuggestionOptions,
    settings?: CSpellSettings
): AsyncIterable<SuggestionsForWordResult> {
    for await (const word of words) {
        yield await suggestionsForWord(word, options, settings);
    }
}

const memorizeSuggestions = memorizeLastCall(cacheSuggestionsForWord);

function cacheSuggestionsForWord(
    options: SuggestOptions,
    settings: CSpellSettings
): (word: string) => Promise<SuggestionsForWordResult> {
    const cache = createAutoResolveCache<string, Promise<SuggestionsForWordResult>>();
    return (word) => cache.get(word, (word) => _suggestionsForWord(word, options, settings));
}

export function suggestionsForWord(
    word: string,
    options: SuggestionOptions = emptySuggestionOptions,
    settings: CSpellSettings = emptyCSpellSettings
): Promise<SuggestionsForWordResult> {
    return memorizeSuggestions(options, settings)(word);
}

async function _suggestionsForWord(
    word: string,
    options: SuggestionOptions,
    settings: CSpellSettings
): Promise<SuggestionsForWordResult> {
    const { languageId, locale: language, includeDefaultConfig = true, dictionaries } = options;

    async function determineDictionaries(config: CSpellSettings): Promise<{
        dictionaryCollection: SpellingDictionaryCollection;
        allDictionaryCollection: SpellingDictionaryCollection;
    }> {
        const withLocale = mergeSettings(
            config,
            util.clean({
                language: language || config.language,
                // dictionaries: dictionaries?.length ? dictionaries : config.dictionaries,
            })
        );
        const withLanguageId = calcSettingsForLanguageId(
            withLocale,
            languageId ?? withLocale.languageId ?? 'plaintext'
        );
        const settings = finalizeSettings(withLanguageId);
        settings.dictionaries = dictionaries?.length ? dictionaries : settings.dictionaries || [];
        validateDictionaries(settings, dictionaries);
        const dictionaryCollection = await getDictionaryInternal(settings);
        settings.dictionaries = settings.dictionaryDefinitions?.map((def) => def.name) || [];
        const allDictionaryCollection = await getDictionaryInternal(settings);
        return {
            dictionaryCollection,
            allDictionaryCollection,
        };
    }

    await refreshDictionaryCache();

    const config = includeDefaultConfig
        ? mergeSettings(getDefaultSettings(settings.loadDefaultConfiguration ?? true), getGlobalSettings(), settings)
        : settings;
    const { dictionaryCollection, allDictionaryCollection } = await determineDictionaries(config);

    return suggestionsForWordSync(word, options, settings, dictionaryCollection, allDictionaryCollection);
}

export function suggestionsForWordSync(
    word: string,
    options: SuggestionOptions,
    settings: CSpellSettings,
    dictionaryCollection: SpellingDictionaryCollection,
    allDictionaryCollection?: SpellingDictionaryCollection
): SuggestionsForWordResult {
    const extendsDictionaryCollection = allDictionaryCollection || dictionaryCollection;
    const {
        locale: language,
        strict = true,
        numChanges = 4,
        numSuggestions = 8,
        includeTies = true,
        includeDefaultConfig = true,
    } = options;
    const ignoreCase = !strict;

    const config = includeDefaultConfig
        ? mergeSettings(getDefaultSettings(settings.loadDefaultConfiguration ?? true), getGlobalSettings(), settings)
        : settings;
    const opts: SuggestOptions = { ignoreCase, numChanges, numSuggestions, includeTies };
    const suggestionsByDictionary = dictionaryCollection.dictionaries.flatMap((dict) =>
        dict.suggest(word, opts).map((r) => ({ ...r, dictName: dict.name }))
    );
    const findOpts: FindOptions = {};
    const locale = adjustLocale(language || config.language || undefined);
    const collator = Intl.Collator(locale);
    const combined = limitResults(
        combine(suggestionsByDictionary.sort((a, b) => a.cost - b.cost || collator.compare(a.word, b.word))),
        numSuggestions,
        includeTies
    );
    adjustCase(combined, word, locale, ignoreCase, extendsDictionaryCollection, findOpts);
    const allSugs = combined.map((sug) => {
        const found = extendsDictionaryCollection.find(sug.word, findOpts);
        return {
            ...sug,
            forbidden: found?.forbidden || false,
            noSuggest: found?.noSuggest || false,
        };
    });

    return {
        word,
        suggestions: limitResults(allSugs, numSuggestions, includeTies),
    };
}

interface SuggestionResultWithDictionaryName extends SuggestionResult {
    dictName: string;
}

function combine(suggestions: SuggestionResultWithDictionaryName[]): SuggestedWordBase[] {
    const words: Map<string, SuggestedWordBase> = new Map();

    for (const sug of suggestions) {
        const { word, cost, dictName, ...rest } = sug;
        const f = words.get(word) || { word, cost, ...rest, dictionaries: [] };
        f.cost = Math.min(f.cost, cost);
        f.dictionaries.push(dictName);
        f.dictionaries.sort();
        words.set(word, f);
    }

    return [...words.values()];
}

function adjustLocale(locale: string | undefined): string | string[] | undefined {
    if (!locale) return undefined;
    const locales = [...normalizeLocaleIntl(locale)].filter((locale) => isValidLocaleIntlFormat(locale));
    if (!locales.length) return undefined;
    if (locales.length === 1) return locales[0];
    return locales;
}

function adjustCase(
    combined: SuggestedWordBase[],
    word: string,
    locale: string | string[] | undefined,
    ignoreCase: boolean,
    allDictionaryCollection: SpellingDictionaryCollection,
    findOpts: FindOptions
): void {
    const knownSugs = new Set(combined.map((sug) => sug.word));
    const matchStyle = { ...analyzeCase(word), locale, ignoreCase };
    /* Add adjusted words */
    combined.forEach((sug) => {
        const alt = matchCase(sug.word, !!sug.isPreferred, matchStyle);
        if (alt !== sug.word && !knownSugs.has(alt)) {
            const found = allDictionaryCollection.find(alt, findOpts);
            if (!found || !found.forbidden || !found.noSuggest) {
                sug.wordAdjustedToMatchCase = alt;
                knownSugs.add(alt);
            }
        }
    });
}

function limitResults<T extends SuggestedWordBase>(
    suggestions: T[],
    numSuggestions: number,
    includeTies: boolean
): T[] {
    let cost = suggestions[0]?.cost;
    let i = 0;
    for (; i < suggestions.length; ++i) {
        if (i >= numSuggestions && (!includeTies || suggestions[i].cost > cost)) {
            break;
        }
        cost = suggestions[i].cost;
    }
    return suggestions.slice(0, i);
}

function validateDictionaries(settings: CSpellSettings, dictionaries: string[] | undefined) {
    if (!dictionaries?.length) return;

    const knownDicts = new Set(settings.dictionaryDefinitions?.map((def) => def.name) || []);

    for (const dict of dictionaries) {
        if (!knownDicts.has(dict)) {
            throw new SuggestionError(`Unknown dictionary: "${dict}"`, 'E_dictionary_unknown');
        }
    }
}

function matchCase(word: string, isPreferred: boolean, style: CaseStyle): string {
    const locale = style.locale;
    if (style.isMixedCaps) {
        /**
         * Do not try matching mixed caps.
         */
        return word;
    }
    if (hasCaps(word)) {
        if (style.isAllCaps) return word.toLocaleUpperCase(locale);
        if (!style.ignoreCase || style.hasCaps || isPreferred) return word;
        if (isTitleCase(word) || isAllCaps(word)) return word.toLocaleLowerCase(locale);
        return word;
    }
    if (!style.hasCaps) return word;
    if (style.isAllCaps) return word.toLocaleUpperCase(locale);
    assert(style.isTitleCase);
    return word.replace(/^\p{L}/u, (firstLetter) => firstLetter.toLocaleUpperCase(locale));
}

interface CaseStyle extends AnalyzeCaseResult {
    locale: string | string[] | undefined;
    ignoreCase: boolean;
}

interface AnalyzeCaseResult {
    isAllCaps: boolean;
    hasCaps: boolean;
    isMixedCaps: boolean;
    isTitleCase: boolean;
}

const regExpHasCaps = /\p{Lu}/u;
const regExpIsAllCaps = /^[\P{L}\p{Lu}]+$/u;
const regExpIsTitleCase = /^\p{Lu}[\P{L}\p{Ll}]+$/u;

function analyzeCase(word: string): AnalyzeCaseResult {
    const hasCaps = regExpHasCaps.test(word);
    const isAllCaps = hasCaps && regExpIsAllCaps.test(word);
    const isTitleCase = hasCaps && !isAllCaps && regExpIsTitleCase.test(word);
    const isMixedCaps = hasCaps && !isAllCaps && !isTitleCase;

    return { hasCaps, isAllCaps, isMixedCaps, isTitleCase };
}

function hasCaps(word: string): boolean {
    return regExpHasCaps.test(word);
}

function isTitleCase(word: string): boolean {
    return regExpIsTitleCase.test(word);
}

function isAllCaps(word: string): boolean {
    return regExpIsAllCaps.test(word);
}

export class SuggestionError extends Error {
    constructor(message: string, readonly code: string) {
        super(message);
    }
}
