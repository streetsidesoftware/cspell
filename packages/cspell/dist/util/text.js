"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XRegExp = require("xregexp");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const gensequence_1 = require("gensequence");
const search_1 = require("./search");
const regExLines = /.*\r?\n/g;
// const regExIdentifiers = XRegExp('(?:\\p{L}|[0-9_\'])+', 'gi');
const regExUpperSOrIng = XRegExp('(\\p{Lu}+\\\\?[\'’]?(?:s|ing|ies|es|ings|ed|ning))(?!\\p{Ll})', 'g');
const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll})', 'g');
const regExWords = XRegExp("\\p{L}(?:\\\\?['’]\\p{L}|\\p{L})+|\\p{L}", 'g');
const regExIgnoreCharacters = XRegExp('\\p{Hiragana}|\\p{Han}|\\p{Katakana}', 'g');
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');
const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;
function splitCamelCaseWordWithOffsetRx(wo) {
    return rxjs_1.from(splitCamelCaseWordWithOffset(wo));
}
exports.splitCamelCaseWordWithOffsetRx = splitCamelCaseWordWithOffsetRx;
function splitCamelCaseWordWithOffset(wo) {
    return splitCamelCaseWord(wo.text)
        .map(gensequence_1.scanMap((last, text) => ({ text, offset: last.offset + last.text.length }), { text: '', offset: wo.offset }));
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
 * This function lets you iterate over regular expression matches.
 */
function match(reg, text) {
    return gensequence_1.sequenceFromRegExpMatch(reg, text);
}
exports.match = match;
function matchStringToTextOffset(reg, text) {
    return matchToTextOffset(reg, { text, offset: 0 });
}
exports.matchStringToTextOffset = matchStringToTextOffset;
function matchToTextOffset(reg, text) {
    const textOffset = text;
    const fnOffsetMap = offsetMap(textOffset.offset);
    return match(reg, textOffset.text)
        .map(m => fnOffsetMap({ text: m[0], offset: m.index }));
}
exports.matchToTextOffset = matchToTextOffset;
function extractLinesOfText(text) {
    return matchStringToTextOffset(regExLines, text);
}
exports.extractLinesOfText = extractLinesOfText;
function extractLinesOfTextRx(text) {
    return rxjs_1.from(extractLinesOfText(text));
}
exports.extractLinesOfTextRx = extractLinesOfTextRx;
/**
 * Extract out whole words from a string of text.
 */
function extractWordsFromTextRx(text) {
    // Comment out the correct implementation until rxjs types get fixed.
    // return Rx.Observable.from(extractWordsFromText(text));
    return rxjs_1.from(extractWordsFromText(text));
}
exports.extractWordsFromTextRx = extractWordsFromTextRx;
/**
 * Extract out whole words from a string of text.
 */
function extractWordsFromText(text) {
    const reg = XRegExp(regExWords);
    return matchStringToTextOffset(reg, text)
        // remove characters that match against \p{L} but are not letters (Chinese characters are an example).
        .map(wo => ({
        text: XRegExp.replace(wo.text, regExIgnoreCharacters, (match) => ' '.repeat(match.length)).trim(),
        offset: wo.offset
    }))
        .filter(wo => !!wo.text);
}
exports.extractWordsFromText = extractWordsFromText;
function extractWordsFromCodeRx(text) {
    return extractWordsFromTextRx(text)
        .pipe(operators_1.concatMap(word => splitCamelCaseWordWithOffsetRx(word)));
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
function offsetMap(offset) {
    return (xo) => (Object.assign({}, xo, { offset: xo.offset + offset }));
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
function calculateTextDocumentOffsets(uri, doc, wordOffsets) {
    const lines = [-1, ...match(/\n/g, doc).map(a => a.index), doc.length];
    function findRowCol(offset) {
        const row = search_1.binarySearch(lines, offset);
        const col = offset - lines[Math.max(0, row - 1)];
        return [row, col];
    }
    return wordOffsets
        .map(wo => {
        const [row, col] = findRowCol(wo.offset);
        return Object.assign({}, wo, { row, col, doc, uri });
    });
}
exports.calculateTextDocumentOffsets = calculateTextDocumentOffsets;
//# sourceMappingURL=text.js.map