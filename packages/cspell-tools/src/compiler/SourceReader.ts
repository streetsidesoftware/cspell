import { RequireFields } from '../types.js';
import { createReader } from './Reader.js';
import type { Reader } from './readers/ReaderOptions.js';
import { parseFileLines, ParseFileOptions } from './wordListParser.js';
import type { AllowedSplitWordsCollection } from './WordsCollection.js';

export interface SourceReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number | undefined;
    /**
     * split words if necessary.
     */
    splitWords: boolean;
    /**
     * Indicate that it is an unformatted file and needs to be cleaned
     * before processing. Applies only to text file sources.
     * @default false
     */
    legacy?: boolean | undefined;

    keepCase?: boolean | undefined;

    allowedSplitWords: AllowedSplitWordsCollection;

    storeSplitWordsAsCompounds: boolean | undefined;

    minCompoundLength?: number | undefined;
}

export type AnnotatedWord = string;

export interface SourceReader {
    size: number;
    words: Iterable<AnnotatedWord>;
}

export async function createSourceReader(filename: string, options: SourceReaderOptions): Promise<SourceReader> {
    const reader = await createReader(filename, options);

    if (reader.type !== 'TextFile') {
        return {
            words: splitLines(reader.lines, options),
            get size() {
                return reader.size;
            },
        };
    }

    return textFileReader(reader, options);
}

function splitLines(lines: Iterable<string>, options: SourceReaderOptions): Iterable<string> {
    if (!options.splitWords) return lines;

    function* split() {
        const regNonWordOrDigit = /[^\p{L}\p{M}'\w-]+/giu;

        for (const line of lines) {
            const words = line.split(regNonWordOrDigit);
            yield* words;
        }
    }

    return split();
}

async function textFileReader(reader: Reader, options: SourceReaderOptions): Promise<SourceReader> {
    const { legacy, splitWords: split, allowedSplitWords, storeSplitWordsAsCompounds, minCompoundLength } = options;
    const parseOptions = {
        legacy,
        split,
        splitKeepBoth: undefined,
        keepCase: undefined,
        allowedSplitWords,
        storeSplitWordsAsCompounds,
        minCompoundLength,
    } as const satisfies RequireFields<ParseFileOptions>;
    const words = [...parseFileLines(reader.lines, parseOptions)];

    return {
        size: words.length,
        words,
    };
}
