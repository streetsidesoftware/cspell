"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Text = require("./util/text");
const TextRange = require("./util/TextRange");
const RxPat = require("./Settings/RegExpPatterns");
exports.defaultMaxNumberOfProblems = 200;
exports.defaultMaxDuplicateProblems = 5;
exports.defaultMinWordLength = 4;
exports.minWordSplitLen = 3;
function validateText(text, dict, options) {
    const { maxNumberOfProblems = exports.defaultMaxNumberOfProblems, maxDuplicateProblems = exports.defaultMaxDuplicateProblems, minWordLength = exports.defaultMinWordLength, flagWords = [], ignoreWords = [], allowCompoundWords = false, } = options;
    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map();
    const includeRanges = calcTextInclusionRanges(text, options);
    const ignoreWordsSet = new Set(ignoreWords.map(a => a.toLowerCase()));
    return Text.extractWordsFromCode(text)
        // Filter out any words that are NOT in the include ranges.
        .scan((acc, textOffset) => {
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
            return { rangePos, isIncluded, textOffset: Object.assign({}, textOffset, { text, offset }) };
        }
        return { rangePos, isIncluded, textOffset };
    }, { textOffset: { text: '', offset: 0 }, isIncluded: false, rangePos: 0 })
        .filter(wr => wr.isIncluded)
        .map(wr => wr.textOffset)
        .map(wo => (Object.assign({}, wo, { isFlagged: setOfFlagWords.has(wo.text) })))
        .filter(wo => wo.isFlagged || wo.text.length >= minWordLength)
        .map(wo => (Object.assign({}, wo, { isFound: isWordValid(dict, wo, text, allowCompoundWords) })))
        .filter(wo => wo.isFlagged || !wo.isFound)
        .filter(wo => !ignoreWordsSet.has(wo.text.toLowerCase()))
        .filter(wo => !RxPat.regExHexDigits.test(wo.text)) // Filter out any hex numbers
        .filter(wo => !RxPat.regExRepeatedChar.test(wo.text)) // Filter out any repeated characters like xxxxxxxxxx
        // Remove anything that is in the ignore list.
        .filter(wo => {
        const word = wo.text.toLowerCase();
        // Keep track of the number of times we have seen the same problem
        mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
        // Filter out if there is too many
        return mapOfProblems.get(word) < maxDuplicateProblems;
    })
        .take(maxNumberOfProblems);
}
exports.validateText = validateText;
function calcTextInclusionRanges(text, options) {
    const { ignoreRegExpList = [], includeRegExpList = [], } = options;
    const filteredIncludeList = includeRegExpList.filter(a => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];
    const includeRanges = TextRange.excludeRanges(TextRange.findMatchingRangesForPatterns(finalIncludeList, text), TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text));
    return includeRanges;
}
exports.calcTextInclusionRanges = calcTextInclusionRanges;
function isWordValid(dict, wo, text, allowCompounds) {
    const firstTry = hasWordCheck(dict, wo.text, allowCompounds);
    return firstTry
        // Drop the first letter if it is preceded by a '\'.
        || (text[wo.offset - 1] === '\\') && hasWordCheck(dict, wo.text.slice(1), allowCompounds);
}
exports.isWordValid = isWordValid;
function hasWordCheck(dict, word, allowCompounds) {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return allowCompounds ? dict.has(word, allowCompounds) : dict.has(word);
}
exports.hasWordCheck = hasWordCheck;
//# sourceMappingURL=textValidator.js.map