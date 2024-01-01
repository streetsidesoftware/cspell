import type { CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';

import { getSources } from '../Settings/index.js';
import type {
    FindResult,
    HasOptions,
    SpellingDictionary,
    SpellingDictionaryCollection,
} from '../SpellingDictionary/index.js';
import {
    createCollection,
    getInlineConfigDictionaries,
    mapSpecialDictionaryNamesToSettings,
} from '../SpellingDictionary/index.js';
import { toFileUrl } from '../util/url.js';
import { uniqueFn } from '../util/util.js';
import { split } from '../util/wordSplitter.js';
import type { TextOffsetRO } from './ValidationTypes.js';

type Href = string;

export interface DictionaryTraceResult {
    word: string;
    found: boolean;
    foundWord: string | undefined;
    forbidden: boolean;
    noSuggest: boolean;
    dictName: string;
    dictSource: string;
    configSource: Href | undefined;
    errors: Error[] | undefined;
}

export interface WordSplits {
    word: string;
    found: boolean;
}

export interface TraceResult extends Array<DictionaryTraceResult> {
    splits?: readonly WordSplits[];
}

export interface TraceOptions extends Pick<CSpellSettingsWithSourceTrace, 'source' | 'allowCompoundWords'> {
    ignoreCase?: boolean;
}

export function traceWord(
    word: string,
    dictCollection: SpellingDictionaryCollection,
    config: TraceOptions,
): TraceResult {
    const opts: HasOptions = {
        ignoreCase: true,
        useCompounds: config.allowCompoundWords || false,
    };

    const splits = split({ text: word, offset: 0 }, 0, checkWord);
    const wfSplits = splits.words.map((s) => ({ word: s.text, found: s.isFound }));

    const unique = uniqueFn((w: WordSplits) => w.word + '|' + w.found);

    const wsFound = { word, found: dictCollection.has(word, opts) };
    const wordSplits = wfSplits.find((s) => s.word === word) ? wfSplits : [wsFound, ...wfSplits];

    const traces = wordSplits
        .filter(unique)
        .map((s) => s.word)
        .flatMap((word) => dictCollection.dictionaries.map((dict) => ({ dict, word })))
        .map(({ dict, word }) => ({ dict, findResult: dict.find(word, opts), word }))
        .flatMap((r) => unpackDictionaryFindResult(r, config));

    const r = new CTraceResult(...traces);
    r.splits = wordSplits;
    return r;

    function checkWord(wo: TextOffsetRO): boolean {
        return dictCollection.has(wo.text, opts);
    }
}

interface FindInDictResult {
    word: string;
    dict: SpellingDictionary;
    findResult: FindResult | undefined;
}

/**
 * Map FindInDictResult to DictionaryTraceResult
 * If the word was found in a dictionary based upon a config field setting, then find the source config.
 * @param found - a word found in a dictionary
 * @param config - the trace config
 * @returns DictionaryTraceResult[]
 */
function unpackDictionaryFindResult(found: FindInDictResult, config: TraceOptions): DictionaryTraceResult[] {
    const { word, dict, findResult } = found;

    const baseResult: DictionaryTraceResult = {
        word,
        found: !!findResult?.found,
        foundWord: findResult?.found || undefined,
        forbidden: findResult?.forbidden || false,
        noSuggest: findResult?.noSuggest || false,
        dictName: dict.name,
        dictSource: dict.source,
        configSource: undefined,
        errors: normalizeErrors(dict.getErrors?.()),
    };

    const configFieldName = mapSpecialDictionaryNamesToSettings.get(dict.name);

    if (!findResult?.found || !configFieldName || !config.source) {
        return [baseResult];
    }

    const opts: HasOptions = {
        ignoreCase: true,
        useCompounds: config.allowCompoundWords || false,
    };

    const sources = getSources(config);

    const results: DictionaryTraceResult[] = [];

    for (const src of sources) {
        if (
            !src[configFieldName] ||
            !Array.isArray(src[configFieldName]) ||
            !src[configFieldName]?.length ||
            !src.source?.filename
        ) {
            continue;
        }
        // We found a possible config, build a dictionary result for it.

        const configSource = toFileUrl(src.source.filename).href;

        const cfg = { [configFieldName]: src[configFieldName] };

        const cfgDict = createCollection(getInlineConfigDictionaries(cfg), dict.name, configSource);

        const findResult = cfgDict.find(word, opts);

        if (!findResult?.found) continue;

        const result: DictionaryTraceResult = {
            word,
            found: !!findResult?.found,
            foundWord: findResult?.found || undefined,
            forbidden: findResult?.forbidden || false,
            noSuggest: findResult?.noSuggest || false,
            dictName: dict.name,
            dictSource: configSource,
            configSource,
            errors: normalizeErrors(dict.getErrors?.()),
        };

        results.push(result);

        // console.log('unpackDictFindResult %o', {
        //     id: src.id,
        //     name: src.name,
        //     filename: src.source?.filename,
        //     configFieldName,
        //     findResult,
        //     cfg,
        //     result,
        // });
    }

    return results.length ? results : [baseResult];
}

function normalizeErrors(errors: Error[] | undefined): Error[] | undefined {
    return errors?.length ? errors : undefined;
}

class CTraceResult extends Array<DictionaryTraceResult> implements TraceResult {
    splits: readonly WordSplits[] = [];
    constructor(...items: DictionaryTraceResult[]) {
        super(...items);
    }
}
