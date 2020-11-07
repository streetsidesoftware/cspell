export function* buffer<T>(iter: Iterable<T>, bufferSize: number): IterableIterator<T[]> {
    const buffer: T[] = [];
    for (const s of iter) {
        buffer.push(s);
        if (buffer.length >= bufferSize) {
            yield buffer;
            buffer.length = 0;
        }
    }
    if (buffer.length) {
        yield buffer;
        buffer.length = 0;
    }
}

export function* bufferLines(iter: Iterable<string>, bufferSize: number, eol: string): IterableIterator<string> {
    if (eol) {
        for (const s of buffer(iter, bufferSize)) {
            yield s.join('') + eol;
        }
    } else {
        for (const s of buffer(iter, bufferSize)) {
            yield s.join('');
        }
    }
}
