import * as Text from './util/text';
import { TextOffset } from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary } from './SpellingDictionary';
import { Sequence } from 'gensequence';
import * as RxPat from './Settings/RegExpPatterns';

export interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreWords?: string[];
    words?: string[];
    userWords?: string[];
    allowCompoundWords?: boolean;
}

export interface IncludeExcludeOptions {
    ignoreRegExpList?: (RegExp|string)[];
    includeRegExpList?: (RegExp|string)[];
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
        ignoreWords          = [],
        allowCompoundWords   = false,
    } = options;

    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map<string, number>();
    const includeRanges = calcTextInclusionRanges(text, options);
    const ignoreWordsSet = new Set(ignoreWords.map(a => a.toLowerCase()));
    const setOfOkWords = new Set<string>();
    const rememberFilter = <T extends TextOffset>(fn: (v: T) => boolean) => ((v: T) => {
        const keep = fn(v);
        if (!keep) {
            setOfOkWords.add(v.text);
        }
        return keep;
    });
    const filterAlreadyChecked = (wo: TextOffset) => {
        return !setOfOkWords.has(wo.text);
    };

    return Text.extractLinesOfText(text)
        .concatMap(mapWordsAgainstRanges(includeRanges))
        .concatMap(Text.extractWordsFromCodeTextOffset)
        .filter(filterAlreadyChecked)
        .map(wo => ({...wo, isFlagged: setOfFlagWords.has(wo.text) }))
        .filter(rememberFilter(wo => wo.isFlagged || wo.text.length >= minWordLength ))
        .map(wo => ({
            ...wo,
            isFound: isWordValid(dict, wo, text, allowCompoundWords)
        }))
        .filter(rememberFilter(wo => wo.isFlagged || ! wo.isFound ))
        .filter(rememberFilter(wo => !ignoreWordsSet.has(wo.text.toLowerCase())))
        .filter(rememberFilter(wo => !RxPat.regExHexDigits.test(wo.text)))  // Filter out any hex numbers
        .filter(rememberFilter(wo => !RxPat.regExRepeatedChar.test(wo.text)))  // Filter out any repeated characters like xxxxxxxxxx
        // Remove anything that is in the ignore list.
        .filter(rememberFilter(wo => {
            const word = wo.text.toLowerCase();
            // Keep track of the number of times we have seen the same problem
            mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
            // Filter out if there is too many
            return mapOfProblems.get(word)! < maxDuplicateProblems;
        }))
        .take(maxNumberOfProblems);
}

export function calcTextInclusionRanges(
    text: string,
    options: IncludeExcludeOptions
): TextRange.MatchRange[] {
    const {
        ignoreRegExpList     = [],
        includeRegExpList    = [],
    } = options;

    const filteredIncludeList = includeRegExpList.filter(a => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];

    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    return includeRanges;
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

/**
 * Returns a mapper function that will
 * @param includeRanges Allowed ranges for words.
 */
function mapWordsAgainstRanges(includeRanges: TextRange.MatchRange[]): ((wo: TextOffset) => Iterable<TextOffset>) {

    let rangePos = 0;

    const mapper = (textOffset: TextOffset) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts: TextOffset[] = [];
        const { text, offset } = textOffset;
        const wordEndPos = offset + text.length;
        let wordStartPos = offset;
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > wordStartPos)) {
            rangePos -= 1;
        }

        while (wordStartPos < wordEndPos) {
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= wordStartPos) {
                rangePos += 1;
            }
            if (!includeRanges[rangePos] || wordEndPos < includeRanges[rangePos].startPos) {
                break;
            }
            const { startPos, endPos } = includeRanges[rangePos];
            const a = Math.max(wordStartPos, startPos);
            const b = Math.min(wordEndPos, endPos);
            parts.push({ offset: a, text: text.slice(a - offset, b - offset) });
            wordStartPos = b;
        }

        return parts.filter(wo => !!wo.text);
    };

    return mapper;
}

export const _testMethods = {
    mapWordsAgainstRanges,
};
