import { CSpellSettings, finalizeSettings } from './Settings';
import { getDictionary } from './SpellingDictionary';
import * as util from './util/util';
import * as Rx from 'rxjs/Rx';

export interface TraceResult {
    word: string;
    found: boolean;
    dictName: string;
    dictSource: string;
    configSource: string;
}

export function traceWords(words: string[], settings: CSpellSettings): Rx.Observable<TraceResult> {
    const r = Rx.Observable.from(words)
    // Combine the words with the configs
    .map(word => ({ word, config: settings }))
    // Load the dictionaries
    .flatMap(async ({word, config}) => {
        const settings = finalizeSettings(config);
        const dictionaries = (settings.dictionaries || [])
            .concat((settings.dictionaryDefinitions || []).map(d => d.name))
            .filter(util.uniqueFn)
        ;
        const dictSettings: CSpellSettings = {...settings, dictionaries };
        const dicts = await getDictionary(dictSettings);
        return { word, config, dicts };
    })
    // Search each dictionary for the word
    .flatMap(({word, config, dicts}) => {
        return dicts.dictionaries.map(dict => ({
            word,
            found: dict.has(word),
            dictName: dict.name,
            dictSource: dict.source,
            configSource: config.name || '',
        }));
    })
    ;

    return r;
}
