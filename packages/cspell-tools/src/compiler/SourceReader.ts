import type { AllowedSplitWords } from './AllowedSplitWords';
import { createReader } from './Reader';
import type { Reader } from './readers/ReaderOptions';
import { parseFileLines } from './wordListParser';

export interface SourceReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number;
    /**
     * split words if necessary.
     */
    splitWords: boolean;
    /**
     * Indicate that it is an unformatted file and needs to be cleaned
     * before processing. Applies only to text file sources.
     * @default false
     */
    legacy?: boolean;

    keepCase?: boolean;

    allowedSplitWords: AllowedSplitWords;
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
            words: reader.lines,
            get size() {
                return reader.size;
            },
        };
    }

    return textFileReader(reader, options);
}

async function textFileReader(reader: Reader, options: SourceReaderOptions): Promise<SourceReader> {
    const { legacy, splitWords: split, allowedSplitWords } = options;
    const words = [...parseFileLines(reader, { legacy, split, allowedSplitWords })];

    return {
        size: words.length,
        words,
    };
}
