"use strict";
// cSpell:ignore curr
// cSpell:words zlib iconv
// cSpell:enableCompoundWords
const fs = require("fs");
const Rx = require("rx");
const RxNode = require("rx-node");
const iconv = require("iconv-lite");
const zlib = require("zlib");
function lineReader(filename, encoding) {
    return stringsToLines(textFileStream(filename, encoding));
}
exports.lineReader = lineReader;
function textFileStream(filename, encoding = 'UTF-8') {
    const pipes = [];
    if (filename.match(/\.gz$/i)) {
        pipes.push(zlib.createGunzip());
    }
    pipes.push(iconv.decodeStream(encoding));
    return RxNode.fromStream(pipes.reduce((s, p) => s.pipe(p), fs.createReadStream(filename)));
}
exports.textFileStream = textFileStream;
function stringsToLines(strings) {
    return Rx.Observable.concat(strings, Rx.Observable.just('\n'))
        .scan((last, curr) => {
        const parts = (last.remainder + curr).split(/\r?\n/);
        const lines = parts.slice(0, -1);
        const remainder = parts.slice(-1)[0];
        return { lines, remainder };
    }, { lines: [], remainder: '' })
        .concatMap(emit => emit.lines);
}
exports.stringsToLines = stringsToLines;
//# sourceMappingURL=fileReader.js.map