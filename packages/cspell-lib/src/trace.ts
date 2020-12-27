import { CSpellSettings, finalizeSettings } from './Settings';
import { getDictionary, SpellingDictionaryCollection } from './SpellingDictionary';
import * as util from './util/util';
import { genSequence } from 'gensequence';

export interface TraceResult {
    word: string;
    found: boolean;
    dictName: string;
    dictSource: string;
    configSource: string;
    errors: Error[] | undefined;
}

export async function traceWords(words: string[], settings: CSpellSettings): Promise<TraceResult[]> {
    async function finalize(
        config: CSpellSettings
    ): Promise<{
        config: CSpellSettings;
        dicts: SpellingDictionaryCollection;
    }> {
        const settings = finalizeSettings(config);
        const dictionaries = (settings.dictionaries || [])
            .concat((settings.dictionaryDefinitions || []).map((d) => d.name))
            .filter(util.uniqueFn);
        const dictSettings: CSpellSettings = { ...settings, dictionaries };
        const dicts = await getDictionary(dictSettings);
        return {
            config: settings,
            dicts,
        };
    }
    const { config, dicts } = await finalize(settings);

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
            return dicts.dictionaries.map((dict) => ({
                word,
                found: dict.has(word),
                dictName: dict.name,
                dictSource: dict.source,
                configSource: config.name || '',
                errors: normalizeErrors(dict.getErrors?.()),
            }));
        })
        .toArray();

    return s;
}
