import type { CSpellSettings, DictionaryId, LocaleId } from '@cspell/cspell-types';
import { genSequence } from 'gensequence';
import { LanguageId } from './LanguageIds';
import { finalizeSettings, mergeSettings } from './Settings';
import { calcSettingsForLanguageId } from './Settings/LanguageSettings';
import { getDictionary, HasOptions, SpellingDictionaryCollection } from './SpellingDictionary';
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
    const { languageId, locale: language, ignoreCase = true, allowCompoundWords } = options || {};

    async function finalize(config: CSpellSettings): Promise<{
        activeDictionaries: DictionaryId[];
        config: CSpellSettings;
        dicts: SpellingDictionaryCollection;
    }> {
        const withLocale = mergeSettings(config, {
            language: language || config.language,
            allowCompoundWords: allowCompoundWords ?? config.allowCompoundWords,
        });
        const withLanguageId = calcSettingsForLanguageId(
            withLocale,
            languageId ?? withLocale.languageId ?? 'plaintext'
        );
        const settings = finalizeSettings(withLanguageId);
        const dictionaries = (settings.dictionaries || [])
            .concat((settings.dictionaryDefinitions || []).map((d) => d.name))
            .filter(util.uniqueFn);
        const dictSettings: CSpellSettings = { ...settings, dictionaries };
        const dictBase = await getDictionary(settings);
        const dicts = await getDictionary(dictSettings);
        const activeDictionaries = dictBase.dictionaries.map((d) => d.name);
        return {
            activeDictionaries,
            config: settings,
            dicts,
        };
    }
    const { config, dicts, activeDictionaries } = await finalize(settings);

    const setOfActiveDicts = new Set(activeDictionaries);
    const opts: HasOptions = { ignoreCase, useCompounds: config.allowCompoundWords };

    const r = await Promise.all(
        genSequence(words)
            // Combine the words with the configs
            .map((word) => ({ word, config, dicts }))
            .toArray()
    );

    function normalizeErrors(errors: Error[] | undefined): Error[] | undefined {
        if (!errors?.length) return undefined;
        return errors;
    }

    // Search each dictionary for the word
    const s = genSequence(r)
        .concatMap((p) => {
            const { word, config, dicts } = p;
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
        })
        .toArray();

    return s;
}
