"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cSpell:enableCompoundWords
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Text = require("./util/text");
const fileReader_1 = require("./util/fileReader");
const XRegExp = require("xregexp");
const regExpWordsWithSpaces = XRegExp('^\\s*\\p{L}+(?:\\s+\\p{L}+){0,3}$');
function loadWordsRx(filename) {
    return fileReader_1.lineReader(filename)
        .pipe(operators_1.catchError((e) => {
        logError(e);
        return rxjs_1.from([]);
    }));
}
exports.loadWordsRx = loadWordsRx;
function logError(e) {
    console.log(e);
}
function splitLine(line) {
    return Text.extractWordsFromText(line).map(({ text }) => text).toArray();
}
exports.splitLine = splitLine;
function splitCodeWords(words) {
    return words
        .map(Text.splitCamelCaseWord)
        .reduce((a, b) => a.concat(b), []);
}
exports.splitCodeWords = splitCodeWords;
function splitLineIntoCodeWordsRx(line) {
    const asMultiWord = regExpWordsWithSpaces.test(line) ? [line] : [];
    const asWords = splitLine(line);
    const splitWords = splitCodeWords(asWords);
    const wordsToAdd = new Set([...asMultiWord, ...asWords, ...splitWords]);
    return rxjs_1.from([...wordsToAdd]);
}
exports.splitLineIntoCodeWordsRx = splitLineIntoCodeWordsRx;
function splitLineIntoWordsRx(line) {
    const asWords = splitLine(line);
    const wordsToAdd = [line, ...asWords];
    return rxjs_1.from(wordsToAdd);
}
exports.splitLineIntoWordsRx = splitLineIntoWordsRx;
//# sourceMappingURL=wordListHelper.js.map