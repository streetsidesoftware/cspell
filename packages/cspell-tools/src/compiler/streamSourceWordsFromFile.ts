import type { SourceReaderOptions } from './SourceReader';
import { createSourceReader } from './SourceReader';

export async function streamSourceWordsFromFile(
    filename: string,
    options: SourceReaderOptions
): Promise<Iterable<string>> {
    const reader = await createSourceReader(filename, options);
    return reader.words;
}
