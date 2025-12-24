import type { SourceReaderOptions } from './SourceReader.ts';
import { createSourceReader } from './SourceReader.ts';

export async function streamSourceWordsFromFile(
    filename: string,
    options: SourceReaderOptions,
): Promise<Iterable<string>> {
    const reader = await createSourceReader(filename, options);
    return reader.words;
}
