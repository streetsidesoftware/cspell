import type { CSpellSettings, DictionaryId, LocaleId } from '@cspell/cspell-types';
import type { ICSpellConfigFile } from 'cspell-config-lib';
import { satisfiesCSpellConfigFile } from 'cspell-config-lib';
import { genSequence } from 'gensequence';

import type { LanguageId } from './fileTypes.js';
import { toInternalSettings } from './Settings/CSpellSettingsServer.js';
import type { CSpellSettingsInternal, DictionaryReferenceCollection } from './Settings/index.js';
import {
    createDictionaryReferenceCollection,
    finalizeSettings,
    mergeSettings,
    resolveConfigFileImports,
} from './Settings/index.js';
import { calcSettingsForLanguageId } from './Settings/LanguageSettings.js';
import type { SpellingDictionaryCollection } from './SpellingDictionary/index.js';
import { getDictionaryInternal, refreshDictionaryCache } from './SpellingDictionary/index.js';
import type { DictionaryTraceResult, WordSplits } from './textValidation/traceWord.js';
import { traceWord } from './textValidation/traceWord.js';
import { toFilePathOrHref } from './util/url.js';
import * as util from './util/util.js';

export interface TraceResult extends DictionaryTraceResult {
    /** True if the dictionary is currently active. */
    dictActive: boolean;
    /** True if the dictionary is blocked from use. */
    dictBlocked: boolean;
}

export interface TraceOptions {
    languageId?: LanguageId | LanguageId[];
    locale?: LocaleId;
    ignoreCase?: boolean;
    allowCompoundWords?: boolean;
    compoundSeparator?: string | undefined;
}

export interface TraceWordResult extends Array<TraceResult> {
    splits: readonly WordSplits[];
}

export async function traceWords(
    words: string[],
    settings: CSpellSettings | ICSpellConfigFile,
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
    settingsOrConfig: CSpellSettings | ICSpellConfigFile,
    options: TraceOptions | undefined,
): AsyncIterableIterator<TraceWordResult> {
    const { languageId, locale: language, ignoreCase = true, allowCompoundWords, compoundSeparator } = options || {};

    const settings = satisfiesCSpellConfigFile(settingsOrConfig)
        ? await resolveConfigFileImports(settingsOrConfig)
        : settingsOrConfig;

    async function finalize(config: CSpellSettings): Promise<{
        activeDictionaries: DictionaryId[];
        dictionaryReferenceCollection: DictionaryReferenceCollection;
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
        const rawDictionaryRefs = [
            ...(settings.dictionaries || []),
            ...(settings.dictionaryDefinitions || []).map((d) => d.name),
        ];
        const dictionaryReferenceCollection = createDictionaryReferenceCollection(rawDictionaryRefs);
        const dictionaries = [...dictionaryReferenceCollection.enabled(), ...dictionaryReferenceCollection.blocked()];
        const dictSettings = toInternalSettings({ ...settings, dictionaries });
        const dictBase = await getDictionaryInternal(settings);
        const dicts = await getDictionaryInternal(dictSettings);
        const activeDictionaries = dictBase.dictionaries.map((d) => d.name);
        return {
            activeDictionaries,
            dictionaryReferenceCollection,
            config: settings,
            dicts,
        };
    }

    await refreshDictionaryCache();
    const { activeDictionaries, config, dicts, dictionaryReferenceCollection } = await finalize(settings);
    const setOfActiveDicts = new Set(activeDictionaries);
    const setOfExcludedDicts = new Set(dictionaryReferenceCollection.blocked());

    function processWord(word: string): TraceWordResult {
        const results = traceWord(word, dicts, { ...config, ignoreCase, compoundSeparator });

        const r = results.map((r) => ({
            ...r,
            dictActive: setOfActiveDicts.has(r.dictName),
            dictBlocked: setOfExcludedDicts.has(r.dictName),
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
