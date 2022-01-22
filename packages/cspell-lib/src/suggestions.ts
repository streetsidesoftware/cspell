import type { CSpellSettings, LocaleId } from '@cspell/cspell-types';
import { LanguageId } from './LanguageIds';
import { finalizeSettings, getDefaultSettings, getGlobalSettings, mergeSettings } from './Settings';
import { calcSettingsForLanguageId } from './Settings/LanguageSettings';
import type { SuggestionResult, SuggestOptions } from './SpellingDictionary';
import { getDictionary, SpellingDictionaryCollection } from './SpellingDictionary';
import * as util from './util/util';

export interface SuggestedWord extends SuggestionResult {
    dictionaries: string[];
}

export interface SuggestionsForWordResult {
    word: string;
    suggestions: SuggestedWord[];
}

export interface SuggestionOptions {
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
    numSuggestions?: number;

    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     * @default 4
     */
    numChanges?: number;

    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default true
     */
    includeTies?: boolean;

    /**
     * By default we want to use the default configuration, but there are cases
     * where someone might not want that.
     * @default true
     */
    includeDefaultConfig?: boolean;
    // allowCompoundWords?: boolean; don't allow for now (maybe never)
}

export async function* suggestionsForWords(
    words: Iterable<string> | AsyncIterable<string>,
    options?: SuggestionOptions,
    settings: CSpellSettings = {}
): AsyncIterable<SuggestionsForWordResult> {
    for await (const word of words) {
        yield await suggestionsForWord(word, options, settings);
    }
}

export async function suggestionsForWord(
    word: string,
    options?: SuggestionOptions,
    settings: CSpellSettings = {}
): Promise<SuggestionsForWordResult> {
    const {
        languageId,
        locale: language,
        strict = true,
        numChanges = 4,
        numSuggestions = 8,
        includeTies = true,
        includeDefaultConfig = true,
        dictionaries,
    } = options || {};
    const ignoreCase = !strict;

    async function finalize(config: CSpellSettings): Promise<{
        dictionaryCollection: SpellingDictionaryCollection;
    }> {
        const withLocale = mergeSettings(config, {
            language: language || config.language,
            // dictionaries: dictionaries?.length ? dictionaries : config.dictionaries,
        });
        const withLanguageId = calcSettingsForLanguageId(
            withLocale,
            languageId ?? withLocale.languageId ?? 'plaintext'
        );
        const settings = finalizeSettings(withLanguageId);

        settings.dictionaries = dictionaries?.length ? dictionaries : settings.dictionaries;

        validateDictionaries(settings, dictionaries);

        const dictionaryCollection = await getDictionary(settings);
        return {
            dictionaryCollection,
        };
    }

    const config = includeDefaultConfig ? mergeSettings(getDefaultSettings(), getGlobalSettings(), settings) : settings;

    const { dictionaryCollection } = await finalize(config);

    const opts: SuggestOptions = { ignoreCase, numChanges, numSuggestions, includeTies };

    const allResults = dictionaryCollection.dictionaries.map((dict) =>
        dict.suggest(word, opts).map((r) => ({ ...r, dictName: dict.name }))
    );

    const allSugs = combine(util.flatten(allResults).sort((a, b) => a.cost - b.cost || (a.word <= b.word ? -1 : 1)));

    return {
        word,
        suggestions: limitResults(allSugs, numSuggestions, includeTies),
    };
}

function combine(suggestions: { word: string; cost: number; dictName: string }[]): SuggestedWord[] {
    const words: Map<string, SuggestedWord> = new Map();

    for (const sug of suggestions) {
        const { word, cost, dictName } = sug;
        const f = words.get(word) || { word, cost, dictionaries: [] };
        f.cost = Math.min(f.cost, cost);
        f.dictionaries.push(dictName);
        f.dictionaries.sort();
        words.set(word, f);
    }

    return [...words.values()];
}

function limitResults(suggestions: SuggestedWord[], numSuggestions: number, includeTies: boolean): SuggestedWord[] {
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

export class SuggestionError extends Error {
    constructor(message: string, readonly code: string) {
        super(message);
    }
}
