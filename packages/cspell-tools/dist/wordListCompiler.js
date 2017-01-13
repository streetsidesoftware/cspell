"use strict";
const XRegExp = require("xregexp");
const gensequence_1 = require("gensequence");
const Text = require("./text");
const fileReader_1 = require("./fileReader");
const fileWriter_1 = require("./fileWriter");
const regNonWordOrSpace = XRegExp("[^\\p{L}' \\-]+", 'gi');
const regExpSpaceOrDash = /(?:\s+)|(?:-+)/g;
const regExpRepeatChars = /(.)\1{3,}/i;
function normalizeWords(lines) {
    return lines.flatMap(line => lineToWords(line).toArray());
}
exports.normalizeWords = normalizeWords;
function lineToWords(line) {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');
    const words = gensequence_1.genSequence(wordGroups)
        .concatMap(a => [a, ...a.split(regExpSpaceOrDash)])
        .concatMap(a => splitCamelCase(a))
        .map(a => a.trim())
        .filter(s => s.length > 2)
        .filter(s => !regExpRepeatChars.test(s))
        .map(a => a.toLowerCase())
        .reduceToSequence((s, w) => s.add(w), new Set());
    return words;
}
exports.lineToWords = lineToWords;
function splitCamelCase(word) {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return gensequence_1.genSequence(splitWords).concatMap(w => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}
function compileSetOfWords(lines) {
    const set = normalizeWords(lines)
        .reduce((s, w) => s.add(w), new Set())
        .toPromise();
    return Promise.all([set]).then(a => a[0]);
}
exports.compileSetOfWords = compileSetOfWords;
function compileWordList(filename, destFilename) {
    return compileSetOfWords(fileReader_1.lineReaderRx(filename)).then(set => {
        const data = gensequence_1.genSequence(set)
            .map(a => a + '\n')
            .toArray()
            .sort()
            .join('');
        return fileWriter_1.writeToFile(destFilename, data);
    });
}
exports.compileWordList = compileWordList;
//# sourceMappingURL=wordListCompiler.js.map