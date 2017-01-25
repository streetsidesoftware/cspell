"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const XRegExp = require("xregexp");
const Rx = require("rxjs/Rx");
const tsmerge_1 = require("tsmerge");
const gensequence_1 = require("gensequence");
const search_1 = require("./search");
const regExLines = /.*\r?\n/g;
// const regExIdentifiers = XRegExp('(?:\\p{L}|[0-9_\'])+', 'gi');
const regExUpperSOrIng = XRegExp('(\\p{Lu}+\'?(?:s|ing|ies|es|ings|ed|ning))(?!\\p{Ll})', 'g');
const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll})', 'g');
const regExWords = XRegExp("\\p{L}(?:[']\\p{L}|\\p{L})+|\\p{L}", 'g');
const regExIgnoreCharacters = XRegExp('\\p{Hiragana}|\\p{Han}|\\p{Katakana}', 'g');
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');
const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;
function splitCamelCaseWordWithOffsetRx(wo) {
    return Rx.Observable.from(splitCamelCaseWordWithOffset(wo));
}
exports.splitCamelCaseWordWithOffsetRx = splitCamelCaseWordWithOffsetRx;
function splitCamelCaseWordWithOffset(wo) {
    return splitCamelCaseWord(wo.word)
        .map(gensequence_1.scanMap((last, word) => ({ word, offset: last.offset + last.word.length }), { word: '', offset: wo.offset }));
}
exports.splitCamelCaseWordWithOffset = splitCamelCaseWordWithOffset;
/**
 * Split camelCase words into an array of strings.
 */
function splitCamelCaseWord(word) {
    const wPrime = word.replace(regExUpperSOrIng, s => s[0] + s.substr(1).toLowerCase());
    const separator = '_<^*_*^>_';
    const pass1 = XRegExp.replace(wPrime, regExSplitWords, '$1' + separator + '$2');
    const pass2 = XRegExp.replace(pass1, regExSplitWords2, '$1' + separator + '$2');
    return XRegExp.split(pass2, separator);
}
exports.splitCamelCaseWord = splitCamelCaseWord;
/**
 * Extract out whole words from a string of text.
 */
function extractWordsFromText1(text) {
    const words = [];
    const reg = XRegExp(regExWords);
    let match;
    while (match = reg.exec(text)) {
        words.push({
            word: match[0],
            offset: match.index
        });
    }
    return words;
}
exports.extractWordsFromText1 = extractWordsFromText1;
/**
 * This function lets you iterate over regular expression matches.
 */
function match(reg, text) {
    return gensequence_1.sequenceFromRegExpMatch(reg, text);
}
exports.match = match;
function matchToTextOffset(reg, text) {
    const textOffset = toTextOffset(text);
    const fnOffsetMap = offsetMap(textOffset.offset);
    return match(reg, textOffset.text)
        .map(m => fnOffsetMap({ text: m[0], offset: m.index }));
}
exports.matchToTextOffset = matchToTextOffset;
function matchToWordOffset(reg, text) {
    return gensequence_1.genSequence(matchToTextOffset(reg, text))
        .map(t => ({ word: t.text, offset: t.offset }));
}
exports.matchToWordOffset = matchToWordOffset;
function extractLinesOfText(text) {
    return matchToTextOffset(regExLines, text);
}
exports.extractLinesOfText = extractLinesOfText;
function extractLinesOfTextRx(text) {
    return Rx.Observable.create(extractLinesOfText(text));
}
exports.extractLinesOfTextRx = extractLinesOfTextRx;
/**
 * Extract out whole words from a string of text.
 */
function extractWordsFromTextRx(text) {
    // Comment out the correct implementation until rxjs types get fixed.
    // return Rx.Observable.from(extractWordsFromText(text));
    // Pretend it is array like.
    return Rx.Observable.from(__assign({}, extractWordsFromText(text), { length: 0 }));
}
exports.extractWordsFromTextRx = extractWordsFromTextRx;
/**
 * Extract out whole words from a string of text.
 */
function extractWordsFromText(text) {
    const reg = XRegExp(regExWords);
    return matchToWordOffset(reg, text)
        .map(wo => ({
        word: XRegExp.replace(wo.word, regExIgnoreCharacters, (match) => ' '.repeat(match.length)).trim(),
        offset: wo.offset
    }))
        .filter(wo => !!wo.word);
}
exports.extractWordsFromText = extractWordsFromText;
function extractWordsFromCodeRx(text) {
    return extractWordsFromTextRx(text)
        .concatMap(word => splitCamelCaseWordWithOffsetRx(word));
}
exports.extractWordsFromCodeRx = extractWordsFromCodeRx;
function extractWordsFromCode(text) {
    return extractWordsFromText(text)
        .concatMap(splitCamelCaseWordWithOffset);
}
exports.extractWordsFromCode = extractWordsFromCode;
function isUpperCase(word) {
    return !!word.match(regExAllUpper);
}
exports.isUpperCase = isUpperCase;
function isLowerCase(word) {
    return !!word.match(regExAllLower);
}
exports.isLowerCase = isLowerCase;
function isFirstCharacterUpper(word) {
    return isUpperCase(word.slice(0, 1));
}
exports.isFirstCharacterUpper = isFirstCharacterUpper;
function isFirstCharacterLower(word) {
    return isLowerCase(word.slice(0, 1));
}
exports.isFirstCharacterLower = isFirstCharacterLower;
function ucFirst(word) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}
exports.ucFirst = ucFirst;
function lcFirst(word) {
    return word.slice(0, 1).toLowerCase() + word.slice(1);
}
exports.lcFirst = lcFirst;
function snakeToCamel(word) {
    return word.split('_').map(ucFirst).join('');
}
exports.snakeToCamel = snakeToCamel;
function camelToSnake(word) {
    return splitCamelCaseWord(word).join('_').toLowerCase();
}
exports.camelToSnake = camelToSnake;
function matchCase(example, word) {
    if (example.match(regExFirstUpper)) {
        return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (example.match(regExAllLower)) {
        return word.toLowerCase();
    }
    if (example.match(regExAllUpper)) {
        return word.toUpperCase();
    }
    if (isFirstCharacterUpper(example)) {
        return ucFirst(word);
    }
    if (isFirstCharacterLower(example)) {
        return lcFirst(word);
    }
    return word;
}
exports.matchCase = matchCase;
function isTextOffset(x) {
    return typeof x === 'object' && typeof x.text === 'string' && typeof x.offset === 'number';
}
exports.isTextOffset = isTextOffset;
function isWordOffset(x) {
    return typeof x === 'object' && typeof x.word === 'string' && typeof x.offset === 'number';
}
exports.isWordOffset = isWordOffset;
function toWordOffset(text) {
    if (typeof text === 'string') {
        return { word: text, offset: 0 };
    }
    if (isWordOffset(text)) {
        return text;
    }
    return { word: text.text, offset: text.offset };
}
exports.toWordOffset = toWordOffset;
function toTextOffset(text) {
    if (typeof text === 'string') {
        return { text: text, offset: 0 };
    }
    if (isTextOffset(text)) {
        return text;
    }
    return { text: text.word, offset: text.offset };
}
exports.toTextOffset = toTextOffset;
function offsetMap(offset) {
    return (xo) => tsmerge_1.merge(xo, { offset: xo.offset + offset });
}
function stringToRegExp(pattern, defaultFlags = 'gim', forceFlags = 'g') {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    try {
        const [, pat, flag] = [...(pattern.match(regExMatchRegExParts) || ['', pattern, defaultFlags]), forceFlags];
        // Make sure the flags are unique.
        const flags = [...(new Set(forceFlags + flag))].join('').replace(/[^gimuy]/g, '');
        if (pat) {
            const regex = new RegExp(pat, flags);
            return regex;
        }
    }
    catch (e) {
    }
    return undefined;
}
exports.stringToRegExp = stringToRegExp;
function calculateTextDocumentOffsets(uri, text, wordOffsets) {
    const lines = [-1, ...match(/\n/g, text).map(a => a.index), text.length];
    function findRowCol(offset) {
        const row = search_1.binarySearch(lines, offset);
        const col = offset - lines[Math.max(0, row - 1)];
        return [row, col];
    }
    return wordOffsets
        .map(wo => {
        const [row, col] = findRowCol(wo.offset);
        return __assign({}, wo, { row, col, text, uri });
    });
}
exports.calculateTextDocumentOffsets = calculateTextDocumentOffsets;
//# sourceMappingURL=text.js.map