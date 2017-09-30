import * as Text from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence } from 'gensequence';
import * as RxPat from './Settings/RegExpPatterns';

export interface ValidationOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreRegExpList?: (RegExp|string)[];
    includeRegExpList?: (RegExp|string)[];
    ignoreWords?: string[];
    words?: string[];
    userWords?: string[];
    allowCompoundWords?: boolean;
}

export interface WordRangeAcc {
    textOffset: Text.TextOffset;
    isIncluded: boolean;
    rangePos: number;
}

export const defaultMaxNumberOfProblems = 200;
export const defaultMaxDuplicateProblems = 5;
export const defaultMinWordLength       = 4;
export const minWordSplitLen            = 3;


export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions
): Sequence<Text.TextOffset> {
    const {
        maxNumberOfProblems  = defaultMaxNumberOfProblems,
        maxDuplicateProblems = defaultMaxDuplicateProblems,
        minWordLength        = defaultMinWordLength,
        flagWords            = [],
        ignoreRegExpList     = [],
        includeRegExpList    = [],
        ignoreWords          = [],
        allowCompoundWords   = false,
    } = options;

    const filteredIncludeList = includeRegExpList.filter(a => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];

    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map<string, number>();
    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    const ignoreWordsSet = new Set(ignoreWords.map(a => a.toLowerCase()));

    return Text.extractWordsFromCode(text)
        // Filter out any words that are NOT in the include ranges.
        .scan<WordRangeAcc>((acc, textOffset) => {
            let { rangePos } = acc;
            const wordEndPos = textOffset.offset + textOffset.text.length;
            const wordStartPos = textOffset.offset;
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= wordStartPos) {
                rangePos += 1;
            }
            const range = includeRanges[rangePos];
            const isIncluded = range && range.startPos < wordEndPos;
            const isPartial = isIncluded && (range.endPos < wordEndPos || range.startPos > wordStartPos);
            if (isPartial) {
                // We need to chop the text.
                const offset = Math.max(range.startPos, wordStartPos);
                const offsetEnd = Math.min(range.endPos, wordEndPos);
                const a = offset - wordStartPos;
                const b = offsetEnd - wordStartPos;
                const text = textOffset.text.slice(a, b);
                return { rangePos, isIncluded, textOffset: { ...textOffset, text, offset } };
            }
            return { rangePos, isIncluded, textOffset };
        }, { textOffset: { text: '', offset: 0 }, isIncluded: false, rangePos: 0})
        .filter(wr => wr.isIncluded)
        .map(wr => wr.textOffset)
        .map(wo => ({...wo, isFlagged: setOfFlagWords.has(wo.text) }))
        .filter(wo => wo.isFlagged || wo.text.length >= minWordLength )
        .map(wo => ({
            ...wo,
            isFound: isWordValid(dict, wo, text, allowCompoundWords)
        }))
        .filter(wo => wo.isFlagged || ! wo.isFound )
        .filter(wo => !ignoreWordsSet.has(wo.text.toLowerCase()))
        .filter(wo => !RxPat.regExHexDigits.test(wo.text))  // Filter out any hex numbers
        .filter(wo => !RxPat.regExRepeatedChar.test(wo.text))  // Filter out any repeated characters like xxxxxxxxxx
        // Remove anything that is in the ignore list.
        .filter(wo => {
            const word = wo.text.toLowerCase();
            // Keep track of the number of times we have seen the same problem
            mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
            // Filter out if there is too many
            return mapOfProblems.get(word)! < maxDuplicateProblems;
        })
        .take(maxNumberOfProblems);
}

export function isWordValid(dict: SpellingDictionary, wo: Text.TextOffset, text: string, allowCompounds: boolean) {
    const firstTry = hasWordCheck(dict, wo.text, allowCompounds);
    return firstTry
        // Drop the first letter if it is preceded by a '\'.
        || (text[wo.offset - 1] === '\\') && hasWordCheck(dict, wo.text.slice(1), allowCompounds);
}

export function hasWordCheck(dict: SpellingDictionary, word: string, allowCompounds: boolean) {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return allowCompounds ? dict.has(word, allowCompounds) : dict.has(word);
}


