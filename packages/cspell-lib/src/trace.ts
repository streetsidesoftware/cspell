import { CSpellSettings, finalizeSettings } from './Settings';
import { getDictionary } from './SpellingDictionary';
import * as util from './util/util';
import { genSequence } from 'gensequence';

export interface TraceResult {
    word: string;
    found: boolean;
    dictName: string;
    dictSource: string;
    configSource: string;
}

export async function traceWords(
    words: string[],
    settings: CSpellSettings
): Promise<TraceResult[]> {
    const r = await Promise.all(
        genSequence(words)
            // Combine the words with the configs
            .map((word) => ({ word, config: settings }))
            // Load the dictionaries
            .map(async ({ word, config }) => {
                const settings = finalizeSettings(config);
                const dictionaries = (settings.dictionaries || [])
                    .concat(
                        (settings.dictionaryDefinitions || []).map(
                            (d) => d.name
                        )
                    )
                    .filter(util.uniqueFn);
                const dictSettings: CSpellSettings = {
                    ...settings,
                    dictionaries,
                };
                const dicts = await getDictionary(dictSettings);
                return { word, config, dicts };
            })
            .toArray()
    );

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
            }));
        })
        .toArray();

    return s;
}
