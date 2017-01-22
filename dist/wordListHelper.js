"use strict";
// cSpell:enableCompoundWords
const Rx = require("rxjs/Rx");
const Text = require("./util/text");
const fileReader_1 = require("./util/fileReader");
const XRegExp = require("xregexp");
const regExpWordsWithSpaces = XRegExp('^\\s*\\p{L}+(?:\\s+\\p{L}+){0,3}$');
function loadWordsRx(filename) {
    return fileReader_1.lineReader(filename).catch((e) => {
        logError(e);
        return Rx.Observable.from([]);
    });
}
exports.loadWordsRx = loadWordsRx;
function logError(e) {
    console.log(e);
}
function splitLine(line) {
    return Text.extractWordsFromText(line).map(({ word }) => word).toArray();
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
    const wordsToAdd = [...asMultiWord, ...asWords, ...splitWords];
    return Rx.Observable.from(wordsToAdd);
}
exports.splitLineIntoCodeWordsRx = splitLineIntoCodeWordsRx;
function splitLineIntoWordsRx(line) {
    const asWords = splitLine(line);
    const wordsToAdd = [line, ...asWords];
    return Rx.Observable.from(wordsToAdd);
}
exports.splitLineIntoWordsRx = splitLineIntoWordsRx;
function rxSplitIntoWords(lines) {
    return lines.flatMap(line => Text.extractWordsFromTextRx(line)
        .map(match => match.word)
        .map(w => w.trim())
        .filter(w => w !== ''));
}
exports.rxSplitIntoWords = rxSplitIntoWords;
function rxSplitCamelCaseWords(words) {
    return words.flatMap(word => Text.splitCamelCaseWord(word));
}
exports.rxSplitCamelCaseWords = rxSplitCamelCaseWords;
//# sourceMappingURL=wordListHelper.js.map