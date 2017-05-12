// cSpell:ignore curr
// cSpell:words zlib iconv
// cSpell:enableCompoundWords
import * as fs from 'fs';
import * as Rx from 'rxjs/Rx';
import * as iconv from 'iconv-lite';
import * as zlib from 'zlib';

export function lineReaderRx(filename: string, encoding?: string): Rx.Observable<string> {
    return stringsToLinesRx(textFileStreamRx(filename, encoding));
}

export function textFileStreamRx(filename: string, encoding: string = 'UTF-8'): Rx.Observable<string> {
    const subject = new Rx.Subject<string>();
    const fnError = (e: Error) => subject.error(e);

    const pipes: NodeJS.ReadWriteStream[] = [];
    if (filename.match(/\.gz$/i)) {
        pipes.push(zlib.createGunzip());
    }
    pipes.push(iconv.decodeStream(encoding));
    const fileStream = fs.createReadStream(filename);
    fileStream.on('error', fnError);
    const stream = pipes.reduce<NodeJS.ReadableStream>((s, p) => s.pipe(p!).on('error', fnError), fileStream);
    stream.on('end', () => subject.complete());
    const streamData = Rx.Observable.fromEvent<string>(stream, 'data');
    streamData.subscribe(s => subject.next(s));
    return subject;
}

export function stringsToLinesRx(strings: Rx.Observable<string>): Rx.Observable<string> {
    return Rx.Observable.concat(strings, Rx.Observable.of('\n'))
        .scan((last: { lines: string[], remainder: string }, curr: string) => {
            const parts = (last.remainder + curr).split(/\r?\n/);
            const lines = parts.slice(0, -1);
            const remainder = parts.slice(-1)[0];
            return {lines, remainder};
        }, { lines: [], remainder: ''})
        .concatMap(emit => emit.lines);
}

