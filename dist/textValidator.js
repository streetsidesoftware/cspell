"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const Text = require("./util/text");
const TextRange = require("./util/TextRange");
const gensequence_1 = require("gensequence");
const RxPat = require("./RegExpPatterns");
;
exports.defaultMaxNumberOfProblems = 200;
exports.defaultMaxDuplicateProblems = 5;
exports.defaultMinWordLength = 4;
exports.minWordSplitLen = 3;
function validateText(text, dict, options) {
    const { maxNumberOfProblems = exports.defaultMaxNumberOfProblems, maxDuplicateProblems = exports.defaultMaxDuplicateProblems, minWordLength = exports.defaultMinWordLength, flagWords = [], ignoreRegExpList = [], includeRegExpList = [], ignoreWords = [], allowCompoundWords = false, } = options;
    const filteredIncludeList = includeRegExpList.filter(a => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];
    const setOfFlagWords = new Set(flagWords);
    const mapOfProblems = new Map();
    const includeRanges = TextRange.excludeRanges(TextRange.findMatchingRangesForPatterns(finalIncludeList, text), TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text));
    const ignoreWordsSet = new Set(ignoreWords.map(a => a.toLowerCase()));
    return Text.extractWordsFromCode(text)
        .scan((acc, word) => {
        let { rangePos } = acc;
        const wordEndPos = word.offset + word.word.length;
        const wordStartPos = word.offset;
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
            const text = word.word.slice(a, b);
            return { rangePos, isIncluded, word: __assign({}, word, { word: text, offset }) };
        }
        return { rangePos, isIncluded, word };
    }, { word: { word: '', offset: 0 }, isIncluded: false, rangePos: 0 })
        .filter(wr => wr.isIncluded)
        .map(wr => wr.word)
        .map(wo => (__assign({}, wo, { isFlagged: setOfFlagWords.has(wo.word) })))
        .filter(wo => wo.isFlagged || wo.word.length >= minWordLength)
        .map(wo => (__assign({}, wo, { isFound: isWordValid(dict, wo, text, allowCompoundWords) })))
        .filter(wo => wo.isFlagged || !wo.isFound)
        .filter(wo => !ignoreWordsSet.has(wo.word.toLowerCase()))
        .filter(wo => !RxPat.regExHexDigits.test(wo.word)) // Filter out any hex numbers
        .filter(wo => !RxPat.regExRepeatedChar.test(wo.word)) // Filter out any repeated characters like xxxxxxxxxx
        .filter(wo => {
        const word = wo.word.toLowerCase();
        // Keep track of the number of times we have seen the same problem
        mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
        // Filter out if there is too many
        return mapOfProblems.get(word) < maxDuplicateProblems;
    })
        .take(maxNumberOfProblems);
}
exports.validateText = validateText;
function isWordValid(dict, wo, text, allowCompounds) {
    const firstTry = hasWordCheck(dict, wo.word, allowCompounds);
    return firstTry
        || (text[wo.offset - 1] === '\\') && hasWordCheck(dict, wo.word.slice(1), allowCompounds);
}
exports.isWordValid = isWordValid;
function hasWordCheck(dict, word, allowCompounds) {
    return dict.has(word) || (allowCompounds && hasCompoundWord(dict, word));
}
exports.hasWordCheck = hasWordCheck;
function hasCompoundWord(dict, word) {
    const foundPair = wordSplitter(word).first(([a, b]) => dict.has(a) && dict.has(b));
    return !!foundPair;
}
exports.hasCompoundWord = hasCompoundWord;
function wordSplitter(word) {
    function* split(word) {
        for (let i = exports.minWordSplitLen; i <= word.length - exports.minWordSplitLen; ++i) {
            yield [word.slice(0, i), word.slice(i)];
        }
    }
    return gensequence_1.genSequence(split(word));
}
exports.wordSplitter = wordSplitter;
//# sourceMappingURL=textValidator.js.map