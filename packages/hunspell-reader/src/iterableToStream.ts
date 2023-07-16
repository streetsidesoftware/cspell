import * as stream from 'stream';

// cspell:words streamable

export type Streamable = string | Buffer;

export type IterableLike<T> = Iterable<T> | IterableIterator<T>;

/**
 * Transform an iterable into a node readable stream.
 */
export function iterableToStream<T extends Streamable>(
    src: IterableLike<T>,
    options: stream.ReadableOptions = { encoding: 'utf8' },
): stream.Readable {
    return new ReadableObservableStream(src, options);
}

class ReadableObservableStream<T> extends stream.Readable {
    private iter: Iterator<T> | undefined;
    private done = false;

    constructor(
        private _source: IterableLike<T>,
        options: stream.ReadableOptions,
    ) {
        super(options);
    }

    _read() {
        if (!this.iter) {
            this.iter = this._source[Symbol.iterator]();
        }
        if (this.done) {
            this.push(null);
            return;
        }

        let r = this.iter.next();
        while (!r.done && this.push(r.value)) {
            r = this.iter.next();
        }
        if (r.done) {
            this.done = true;
            // since it is possible for r.value to have something meaningful, we must check.
            if (r.value !== null && r.value !== undefined) {
                this.push(r.value);
            }
            this.push(null);
        }
    }
}

export default iterableToStream;
