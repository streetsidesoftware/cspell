import { opCombine, opFilter, Operator } from '@cspell/cspell-pipe/sync';
import { uniqueFilter } from 'hunspell-reader/dist/util';
import { CompileOptions } from './CompileOptions';

export function createSortAndFilterOperation(options: CompileOptions): Operator<string> {
    const operations: Operator<string>[] = [
        options.stripNonStrictPrefix ? opFilter<string>((w) => !w.startsWith('~')) : undefined,
        opFilter<string>((a) => !!a),
        options.sort ? createInlineBufferedSort() : undefined,
        opFilter<string>(uniqueFilter(10000)),
    ].filter(isDefined);
    return opCombine(...operations);
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

function createInlineBufferedSort(bufferSize = 1000): (lines: Iterable<string>) => Iterable<string> {
    function* inlineBufferedSort(lines: Iterable<string>): Iterable<string> {
        const buffer: string[] = [];

        for (const line of lines) {
            buffer.push(line);
            if (buffer.length >= bufferSize) {
                buffer.sort();
                yield* buffer;
                buffer.length = 0;
            }
        }

        buffer.sort();
        yield* buffer;
    }

    return inlineBufferedSort;
}
