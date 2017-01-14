"use strict";
const fs = require("fs");
const Rx = require("rx");
const RxNode = require("rx-node");
const iconv = require("iconv-lite");
function lineReader(filename, encoding) {
    return stringsToLines(textFileStream(filename, encoding));
}
exports.lineReader = lineReader;
function textFileStream(filename, encoding = 'UTF-8') {
    return RxNode.fromStream(fs.createReadStream(filename).pipe(iconv.decodeStream(encoding)));
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