// cSpell:ignore curr
// cSpell:words zlib iconv
// cSpell:enableCompoundWords
import * as fs from 'fs';
import * as Rx from 'rxjs/Rx';
import * as iconv from 'iconv-lite';
import * as zlib from 'zlib';
import * as readline from 'readline';

const defaultEncoding = 'utf8';

/**
 * Reads a file line by line. The last value emitted by the Observable is always an empty string.
 * @param filename
 * @param encoding defaults to 'utf8'
 */
export function lineReaderRx(filename: string, encoding?: string): Rx.Observable<string> {
    return stringsToLinesRx(textFileStreamRx(filename, encoding));
}

function prepareFileStream(
    filename: string,
    encoding: string,
    fnError: (e: Error) => void,
) {
    const pipes: NodeJS.ReadWriteStream[] = [];
    if (filename.match(/\.gz$/i)) {
        pipes.push(zlib.createGunzip());
    }
    pipes.push(iconv.decodeStream(encoding));
    const fileStream = fs.createReadStream(filename);
    fileStream.on('error', fnError);
    const stream = pipes.reduce<NodeJS.ReadableStream>((s, p) => s.pipe(p!).on('error', fnError), fileStream);
    return stream;
}

export function textFileStreamRx(filename: string, encoding: string = defaultEncoding): Rx.Observable<string> {
    const subject = new Rx.Subject<string>();
    const fnError = (e: Error) => subject.error(e);
    const fnComplete = () => subject.complete();
    const stream = prepareFileStream(filename, encoding, fnError);
    stream.on('end', fnComplete);
    stream.on('data', s => subject.next(s));
    return subject;
}

/**
 * Emit a file line by line
 * @param filename full path to the file to read.
 * @param encoding defaults to 'utf8'
 */
export function streamFileLineByLineRx(filename: string, encoding: string = defaultEncoding): Rx.Observable<string> {
    const subject = new Rx.Subject<string>();
    let data = '.';
    const fnError = (e: Error) => subject.error(e);
    const fnComplete = () => {
        // readline will consume the last newline without emitting an empty last line.
        // If the last data read contains a new line, then emit an empty string.
        if (data.match(/(?:(?:\r?\n)|(?:\r))$/)) {
            subject.next('');
        }
        subject.complete();
    };
    const stream = prepareFileStream(filename, encoding, fnError);
    // We want to capture the last line.
    stream.on('data', d => data = d);
    const rl = readline.createInterface({
        input: stream,
        terminal: false,
    });
    rl.on('close', fnComplete);
    rl.on('line', (text: string) => subject.next(text));
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
