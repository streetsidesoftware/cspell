import type { CSpellSettings, DictionaryId, LocaleId } from '@cspell/cspell-types';
import { genSequence } from 'gensequence';

import type { LanguageId } from './LanguageIds.js';
import type { CSpellSettingsInternal } from './Models/CSpellSettingsInternalDef.js';
import { toInternalSettings } from './Settings/CSpellSettingsServer.js';
import { finalizeSettings, mergeSettings } from './Settings/index.js';
import { calcSettingsForLanguageId } from './Settings/LanguageSettings.js';
import type { SpellingDictionaryCollection } from './SpellingDictionary/index.js';
import { getDictionaryInternal, refreshDictionaryCache } from './SpellingDictionary/index.js';
import type { WordSplits } from './textValidation/traceWord.js';
import { traceWord } from './textValidation/traceWord.js';
import { toFilePathOrHref } from './util/url.js';
import * as util from './util/util.js';

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
    preferredSuggestions?: string[] | undefined;
    errors: Error[] | undefined;
}
export interface TraceOptions {
    languageId?: LanguageId | LanguageId[];
    locale?: LocaleId;
    ignoreCase?: boolean;
    allowCompoundWords?: boolean;
}

export interface TraceWordResult extends Array<TraceResult> {
    splits: readonly WordSplits[];
}

export async function traceWords(
    words: string[],
    settings: CSpellSettings,
    options: TraceOptions | undefined,
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
    options: TraceOptions | undefined,
): AsyncIterableIterator<TraceWordResult> {
    const { languageId, locale: language, ignoreCase = true, allowCompoundWords } = options || {};

    async function finalize(config: CSpellSettings): Promise<{
        activeDictionaries: DictionaryId[];
        config: CSpellSettingsInternal;
        dicts: SpellingDictionaryCollection;
    }> {
        const withLocale = mergeSettings(
            config,
            util.clean({
                language: language || config.language,
                allowCompoundWords: allowCompoundWords ?? config.allowCompoundWords,
            }),
        );
        const withLanguageId = calcSettingsForLanguageId(
            withLocale,
            languageId ?? withLocale.languageId ?? 'plaintext',
        );
        const settings = finalizeSettings(withLanguageId);
        const dictionaries = [
            ...(settings.dictionaries || []),
            ...(settings.dictionaryDefinitions || []).map((d) => d.name),
        ].filter(util.uniqueFn);
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

    function processWord(word: string): TraceWordResult {
        const results = traceWord(word, dicts, { ...config, ignoreCase });

        const r = results.map((r) => ({
            ...r,
            dictActive: setOfActiveDicts.has(r.dictName),
            dictSource: toFilePathOrHref(r.dictSource),
            configSource: r.configSource || config.name || '',
            splits: results.splits,
        }));

        const tr = new CTraceResult(...r);
        results.splits && tr.splits.push(...results.splits);

        return tr;
    }

    for await (const word of words) {
        yield processWord(word);
    }
}

class CTraceResult extends Array<TraceResult> implements TraceWordResult {
    splits: WordSplits[] = [];
    constructor(...items: TraceResult[]) {
        super(...items);
    }
}
