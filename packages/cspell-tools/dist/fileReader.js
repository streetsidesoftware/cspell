"use strict";
// cSpell:ignore curr
// cSpell:words zlib iconv
// cSpell:enableCompoundWords
const fs = require("fs");
const Rx = require("rxjs/Rx");
const iconv = require("iconv-lite");
const zlib = require("zlib");
function lineReaderRx(filename, encoding) {
    return stringsToLinesRx(textFileStreamRx(filename, encoding));
}
exports.lineReaderRx = lineReaderRx;
function textFileStreamRx(filename, encoding = 'UTF-8') {
    const subject = new Rx.Subject();
    const fnError = (e) => subject.error(e);
    const pipes = [];
    if (filename.match(/\.gz$/i)) {
        pipes.push(zlib.createGunzip());
    }
    pipes.push(iconv.decodeStream(encoding));
    const fileStream = fs.createReadStream(filename);
    fileStream.on('error', fnError);
    const stream = pipes.reduce((s, p) => s.pipe(p).on('error', fnError), fileStream);
    stream.on('end', () => subject.complete());
    const streamData = Rx.Observable.fromEvent(stream, 'data');
    streamData.subscribe(s => subject.next(s));
    return subject;
}
exports.textFileStreamRx = textFileStreamRx;
function stringsToLinesRx(strings) {
    return Rx.Observable.concat(strings, Rx.Observable.of('\n'))
        .scan((last, curr) => {
        const parts = (last.remainder + curr).split(/\r?\n/);
        const lines = parts.slice(0, -1);
        const remainder = parts.slice(-1)[0];
        return { lines, remainder };
    }, { lines: [], remainder: '' })
        .concatMap(emit => emit.lines);
}
exports.stringsToLinesRx = stringsToLinesRx;
//# sourceMappingURL=fileReader.js.map