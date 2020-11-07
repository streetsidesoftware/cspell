import { genSequence } from 'gensequence';
import { SuggestionCollector, SuggestionResult, CompoundWordsMethod } from 'cspell-trie-lib';
import { ucFirst, removeAccents, isUpperCase } from '../util/text';
import { FunctionArgs } from '../util/types';
import { SpellingDictionary, HasOptions, SearchOptions } from './SpellingDictionary';

// cspell:word café

export {
    CompoundWordsMethod,
    JOIN_SEPARATOR,
    SuggestionCollector,
    suggestionCollector,
    SuggestionResult,
    WORD_SEPARATOR,
} from 'cspell-trie-lib';

export type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;

export const PREFIX_NO_CASE = '>';
export const regexPrefix = /^[>]/;

export type SuggestArgs =
    | FunctionArgs<SpellingDictionary['suggest']>
    | FunctionArgs<
          (
              word: string,
              numSuggestions?: number,
              compoundMethod?: CompoundWordsMethod,
              numChanges?: number
          ) => SuggestionResult[]
      >;

export const defaultNumSuggestions = 10;

export function impersonateCollector(collector: SuggestionCollector, word: string): SuggestionCollector {
    return {
        collect: collector.collect,
        add: (suggestion: SuggestionResult) => collector.add(suggestion),
        get suggestions() {
            return collector.suggestions;
        },
        get maxCost() {
            return collector.maxCost;
        },
        get word() {
            return word;
        },
        get maxNumSuggestions() {
            return collector.maxNumSuggestions;
        },
        includesTies: false,
    };
}

export function wordSearchForms(word: string, isDictionaryCaseSensitive: boolean, ignoreCase: boolean): string[] {
    // if (!isDictionaryCaseSensitive) {
    //     return [word.toLowerCase()];
    // }
    const forms = new Set<string>();
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordLcNa = removeAccents(wordLc);
    if (ignoreCase) {
        if (isDictionaryCaseSensitive) {
            forms.add(wordLcNa);
        } else {
            forms.add(wordLc);
            forms.add(wordLcNa);
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
        }
    }

    return [...forms];
}

interface DictionaryWordForm {
    w: string; // the word
    p: string; // prefix to add
}
function* wordDictionaryForms(word: string, isDictionaryCaseSensitive: boolean): IterableIterator<DictionaryWordForm> {
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordNa = removeAccents(word);
    const wordLcNa = removeAccents(wordLc);
    function wf(w: string, p = '') {
        return { w, p };
    }

    const prefix = isDictionaryCaseSensitive ? PREFIX_NO_CASE : '';
    yield wf(word);
    yield wf(wordNa, prefix);
    yield wf(wordLc, prefix);
    yield wf(wordLcNa, prefix);
}

export function wordDictionaryFormsCollector(isDictionaryCaseSensitive: boolean): (word: string) => Iterable<string> {
    const knownWords = new Set<string>();

    return (word: string) => {
        return genSequence(wordDictionaryForms(word, isDictionaryCaseSensitive))
            .filter((w) => !knownWords.has(w.w))
            .map((w) => w.p + w.w)
            .filter((w) => !knownWords.has(w))
            .map((w) => (knownWords.add(w), w));
    };
}

export function hasOptionToSearchOption(opt: HasOptions | undefined): SearchOptions {
    return !opt ? {} : typeof opt === 'object' ? opt : { useCompounds: opt };
}

export const __testMethods = {
    wordSearchForms,
    wordDictionaryForms,
    wordDictionaryFormsCollector,
};
