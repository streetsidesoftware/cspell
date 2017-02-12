"use strict";
const Rx = require("rxjs/Rx");
const stream = require("stream");
const iconv = require("iconv-lite");
/**
 * This is a simple implementation of converting an Observable into a stream.
 * It does NOT correctly handle situations where the stream buffer is full.
 */
function observableToStream(data, options) {
    const sourceStream = new stream.PassThrough(options);
    data.subscribe(data => sourceStream.write(data, 'UTF-8'), error => sourceStream.emit('error', error), () => sourceStream.end());
    return sourceStream;
}
exports.observableToStream = observableToStream;
function streamToRx(stream) {
    const subject = new Rx.Subject();
    stream.on('end', () => subject.complete());
    stream.on('error', (e) => subject.error(e));
    stream.on('data', (data) => subject.next(data));
    return subject;
}
exports.streamToRx = streamToRx;
function streamToStringRx(stream, encoding = 'UTF-8') {
    return streamToRx(stream)
        .map(buffer => iconv.decode(buffer, encoding));
}
exports.streamToStringRx = streamToStringRx;
//# sourceMappingURL=rxStreams.js.map