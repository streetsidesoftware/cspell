"use strict";
const fs = require("fs");
const zlib = require("zlib");
const stream = require("stream");
function writeToFile(filename, data) {
    const buffer = Buffer.from(data);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return bufferStream.pipe(zip).pipe(fs.createWriteStream(filename));
}
exports.writeToFile = writeToFile;
//# sourceMappingURL=fileWriter.js.map