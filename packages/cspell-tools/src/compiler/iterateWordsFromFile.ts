import { Sequence } from 'gensequence';
import { createReader, ReaderOptions } from './Reader';

export async function streamWordsFromFile(
    filename: string,
    options: ReaderOptions
): Promise<Sequence<string>> {
    const reader = await createReader(filename, options);
    return reader[Symbol.iterator]();
}
