import { DictionaryInformation } from '@cspell/cspell-types';
import {
    CompoundWordsMethod,
    mapDictionaryInformationToWeightMap,
    SuggestionCollector,
    SuggestionResult,
    WeightMap,
} from 'cspell-trie-lib';
import { genSequence } from 'gensequence';
import { isUpperCase, removeAccents, ucFirst } from '../util/text';
import { HasOptions, SearchOptions, SpellingDictionary, SuggestOptions } from './SpellingDictionary';

export { suggestionCollector } from 'cspell-trie-lib';

export type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;

export type SuggestArgs =
    | Parameters<SpellingDictionary['suggest']>
    | Parameters<
          (
              word: string,
              numSuggestions?: number,
              compoundMethod?: CompoundWordsMethod,
              numChanges?: number,
              ignoreCase?: boolean
          ) => SuggestionResult[]
      >;

export const defaultNumSuggestions = 10;

export function impersonateCollector(collector: SuggestionCollector, word: string): SuggestionCollector {
    const r = Object.create(collector);
    Object.defineProperty(r, 'word', { value: word, writable: false });
    return r;
}

export function wordSearchFormsArray(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): string[] {
    return [...wordSearchForms(word, isDictionaryCaseSensitive, ignoreCase)];
}

export function wordSearchForms(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): Set<string> {
    const forms = new Set<string>();
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    if (ignoreCase) {
        if (isDictionaryCaseSensitive) {
            forms.add(wordLc);
        } else {
            forms.add(wordLc);
            // Legacy remove any unbound accents
            forms.add(wordLc.replace(/\p{M}/gu, ''));
        }
    } else {
        if (isDictionaryCaseSensitive) {
            forms.add(word);
            forms.add(wordLc);
            // HOUSE -> House, house
            if (isUpperCase(word)) {
                forms.add(ucFirst(wordLc));
            }
        } else {
            forms.add(wordLc);
            // Legacy remove any unbound accents
            forms.add(wordLc.replace(/\p{M}/gu, ''));
        }
    }
    return forms;
}

export function wordSuggestFormsArray(word: string): string[] {
    return [...wordSuggestForms(word)];
}

export function wordSuggestForms(word: string): Set<string> {
    word = word.normalize('NFC');
    const forms = new Set<string>([word]);
    const wordLc = word.toLowerCase();
    forms.add(wordLc);
    return forms;
}

interface DictionaryWordForm {
    w: string; // the word
    p: string; // prefix to add
}
function* wordDictionaryForms(word: string, prefixNoCase: string): IterableIterator<DictionaryWordForm> {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    function wf(w: string, p = '') {
        return { w, p };
    }

    const prefix = prefixNoCase;
    yield wf(word);
    yield wf(wordNa, prefix);
    yield wf(wordLc, prefix);
    yield wf(wordLcNa, prefix);
}

export function wordDictionaryFormsCollector(prefixNoCase: string): (word: string) => Iterable<string> {
    const knownWords = new Set<string>();

    return (word: string) => {
        return genSequence(wordDictionaryForms(word, prefixNoCase))
            .filter((w) => !knownWords.has(w.w))
            .map((w) => w.p + w.w)
            .filter((w) => !knownWords.has(w))
            .map((w) => (knownWords.add(w), w));
    };
}

export function hasOptionToSearchOption(opt: HasOptions | undefined): SearchOptions {
    return !opt ? {} : opt;
}

export function suggestArgsToSuggestOptions(args: SuggestArgs): SuggestOptions {
    const [_word, options, compoundMethod, numChanges, ignoreCase] = args;
    const suggestOptions: SuggestOptions =
        typeof options === 'object'
            ? options
            : {
                  numSuggestions: options,
                  compoundMethod,
                  numChanges,
                  ignoreCase,
                  includeTies: undefined,
                  timeout: undefined,
              };
    return suggestOptions;
}
export function createWeightMapFromDictionaryInformation(di: undefined): undefined;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation): WeightMap;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation | undefined): WeightMap | undefined;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation | undefined): WeightMap | undefined {
    return di ? mapDictionaryInformationToWeightMap(di) : undefined;
}

export const __testMethods = {
    wordSearchForms,
    wordSearchFormsArray,
    wordDictionaryForms,
    wordDictionaryFormsCollector,
};
