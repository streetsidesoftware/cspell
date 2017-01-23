"use strict";
const fs = require("fs");
const zlib = require("zlib");
const stream = require("stream");
const rxStreams_1 = require("./rxStreams");
function writeToFile(filename, data) {
    const buffer = Buffer.from(data);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return bufferStream.pipe(zip).pipe(fs.createWriteStream(filename));
}
exports.writeToFile = writeToFile;
function writeToFileRx(filename, data) {
    const sourceStream = rxStreams_1.observableToStream(data);
    const writeStream = fs.createWriteStream(filename);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return sourceStream.pipe(zip).pipe(writeStream);
}
exports.writeToFileRx = writeToFileRx;
function writeToFileRxP(filename, data) {
    const stream = writeToFileRx(filename, data);
    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', (e) => reject(e));
    });
}
exports.writeToFileRxP = writeToFileRxP;
//# sourceMappingURL=fileWriter.js.map