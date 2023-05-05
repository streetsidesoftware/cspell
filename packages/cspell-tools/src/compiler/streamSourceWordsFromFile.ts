import type { SourceReaderOptions } from './SourceReader.js';
import { createSourceReader } from './SourceReader.js';

export async function streamSourceWordsFromFile(
    filename: string,
    options: SourceReaderOptions
): Promise<Iterable<string>> {
    const reader = await createSourceReader(filename, options);
    return reader.words;
}
