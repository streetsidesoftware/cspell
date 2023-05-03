import type { BaseReader } from './ReaderOptions.js';
import { readTextFile } from './readTextFile.js';

export async function textFileReader(filename: string): Promise<BaseReader> {
    const content = await readTextFile(filename);
    const words = content.split('\n').map((s) => s.trim());

    return {
        type: 'TextFile',
        size: words.length,
        lines: words,
    };
}
