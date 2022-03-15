import type { CSpellSettings, DictionaryId, LocaleId } from '@cspell/cspell-types';
import { genSequence } from 'gensequence';
import { LanguageId } from './LanguageIds';
import { finalizeSettings, mergeSettings } from './Settings';
import { toInternalSettings } from './Settings/CSpellSettingsServer';
import { calcSettingsForLanguageId } from './Settings/LanguageSettings';
import {
    getDictionaryInternal,
    HasOptions,
    refreshDictionaryCache,
    SpellingDictionaryCollection,
} from './SpellingDictionary';
import * as util from './util/util';

export interface TraceResult {
    word: string;
    found: boolean;
    foundWord: string | undefined;
    forbidden: boolean;
    noSuggest: boolean;
    dictName: string;
    dictSource: string;
    dictActive: boolean;
    configSource: string;
    errors: Error[] | undefined;
}
export interface TraceOptions {
    languageId?: LanguageId | LanguageId[];
    locale?: LocaleId;
    ignoreCase?: boolean;
    allowCompoundWords?: boolean;
}

export async function traceWords(
    words: string[],
    settings: CSpellSettings,
    options: TraceOptions | undefined
): Promise<TraceResult[]> {
    const results = await util.asyncIterableToArray(traceWordsAsync(words, settings, options));

    const s = genSequence(results)
        .concatMap((p) => p)
        .toArray();

    return s;
}

export async function* traceWordsAsync(
    words: Iterable<string> | AsyncIterable<string>,
    settings: CSpellSettings,
    options: TraceOptions | undefined
): AsyncIterableIterator<TraceResult[]> {
    const { languageId, locale: language, ignoreCase = true, allowCompoundWords } = options || {};

    async function finalize(config: CSpellSettings): Promise<{
        activeDictionaries: DictionaryId[];
        config: CSpellSettings;
        dicts: SpellingDictionaryCollection;
    }> {
        const withLocale = mergeSettings(
            config,
            util.clean({
                language: language || config.language,
                allowCompoundWords: allowCompoundWords ?? config.allowCompoundWords,
            })
        );
        const withLanguageId = calcSettingsForLanguageId(
            withLocale,
            languageId ?? withLocale.languageId ?? 'plaintext'
        );
        const settings = finalizeSettings(withLanguageId);
        const dictionaries = (settings.dictionaries || [])
            .concat((settings.dictionaryDefinitions || []).map((d) => d.name))
            .filter(util.uniqueFn);
        const dictSettings = toInternalSettings({ ...settings, dictionaries });
        const dictBase = await getDictionaryInternal(settings);
        const dicts = await getDictionaryInternal(dictSettings);
        const activeDictionaries = dictBase.dictionaries.map((d) => d.name);
        return {
            activeDictionaries,
            config: settings,
            dicts,
        };
    }

    await refreshDictionaryCache();
    const { config, dicts, activeDictionaries } = await finalize(settings);
    const setOfActiveDicts = new Set(activeDictionaries);
    const opts: HasOptions = util.clean({ ignoreCase, useCompounds: config.allowCompoundWords });

    function normalizeErrors(errors: Error[] | undefined): Error[] | undefined {
        if (!errors?.length) return undefined;
        return errors;
    }

    function processWord(word: string) {
        return dicts.dictionaries
            .map((dict) => ({ dict, findResult: dict.find(word, opts) }))
            .map(({ dict, findResult }) => ({
                word,
                found: !!findResult?.found,
                foundWord: findResult?.found || undefined,
                forbidden: findResult?.forbidden || false,
                noSuggest: findResult?.noSuggest || false,
                dictName: dict.name,
                dictSource: dict.source,
                dictActive: setOfActiveDicts.has(dict.name),
                configSource: config.name || '',
                errors: normalizeErrors(dict.getErrors?.()),
            }));
    }

    for await (const word of words) {
        yield processWord(word);
    }
}
