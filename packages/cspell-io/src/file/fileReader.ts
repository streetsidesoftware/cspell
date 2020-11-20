// cSpell:ignore curr
// cSpell:words zlib iconv
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as zlib from 'zlib';
import * as readline from 'readline';
import {} from 'stream';

const defaultEncoding: BufferEncoding = 'utf8';

export function readFile(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<string> {
    return new Promise((resolve, reject) => {
        const data: string[] = [];
        const stream = prepareFileStream(filename, encoding, reject);
        let resolved = false;
        function complete() {
            resolve(data.join(''));
            resolved = resolved || (resolve(data.join('')), true);
        }
        stream.on('error', reject);
        stream.on('data', (d: string) => data.push(d));
        stream.on('close', complete);
        stream.on('end', complete);
    });
}

/**
 * Reads a file line by line. The last value emitted by the Observable is always an empty string.
 * @param filename
 * @param encoding defaults to 'utf8'
 */
export function lineReaderAsync(filename: string, encoding: BufferEncoding = defaultEncoding): AsyncIterable<string> {
    return streamFileLineByLineAsync(filename, encoding);
}

function prepareFileStream(filename: string, encoding: string, fnError: (e: Error) => void) {
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

/**
 * Emit a file line by line
 * @param filename full path to the file to read.
 * @param encoding defaults to 'utf8'
 */
export function streamFileLineByLineAsync(
    filename: string,
    encoding: BufferEncoding = defaultEncoding
): AsyncIterableIterator<string> {
    const fnError = (e: Error) => {
        iter.throw && iter.throw(e);
    };
    const stream = prepareFileStream(filename, encoding, fnError);
    const iter = streamLineByLineAsync(stream);
    return iter;
}

type Resolve<T> = (value: T | Promise<T>) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reject = (reason?: any) => void;

interface Resolvers<T = IteratorResult<string>> {
    resolve: Resolve<T>;
    reject: Reject;
}

/**
 * Emit a file line by line
 * @param filename full path to the file to read.
 * @param encoding defaults to 'utf8'
 */
export function streamLineByLineAsync(
    stream: NodeJS.ReadableStream,
    encoding: BufferEncoding = defaultEncoding
): AsyncIterableIterator<string> {
    let data = '.';
    let done = false;
    let error: Error | any;
    const buffer: string[] = [];
    const pending: Resolvers[] = [];
    const fnError = (e: Error | any) => {
        error = e;
    };
    const fnComplete = () => {
        // readline will consume the last newline without emitting an empty last line.
        // If the last data read contains a new line, then emit an empty string.
        if (data.match(/(?:(?:\r?\n)|(?:\r))$/)) {
            buffer.push('');
        }
        processBuffer();
        done = true;
    };
    // We want to capture the last line.
    stream.on('data', (d) => (data = dataToString(d, encoding)));
    stream.on('error', fnError);
    const rl = readline.createInterface({
        input: stream,
        terminal: false,
    });
    rl.on('close', fnComplete);
    rl.on('line', (text: string) => {
        buffer.push(text);
        processBuffer();
    });

    function registerPromise(resolve: Resolve<IteratorResult<string>>, reject: Reject) {
        pending.push({ resolve, reject });
        processBuffer();
    }

    function processBuffer() {
        if (error && pending.length && !buffer.length) {
            const p = pending.shift();
            p?.reject(error);
            return;
        }
        while (pending.length && buffer.length) {
            const p = pending.shift();
            const b = buffer.shift();
            if (b !== undefined && p) {
                p.resolve({ done: false, value: b });
            }
        }
        if (!done) {
            pending.length ? rl.resume() : rl.pause();
        }
        if (done && pending.length && !buffer.length) {
            const p = pending.shift();
            p?.resolve({ done, value: undefined });
        }
    }

    const iter: AsyncIterableIterator<string> = {
        [Symbol.asyncIterator]: () => iter,
        next() {
            return new Promise(registerPromise);
        },
        throw(e?: any) {
            fnError(e);
            return new Promise(registerPromise);
        },
    };

    return iter;
}

function dataToString(data: string | Buffer, encoding: BufferEncoding = 'utf8'): string {
    if (typeof data === 'string') {
        return data;
    }
    return data.toString(encoding);
}
