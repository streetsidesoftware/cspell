import type { TextFile, TextFileRef } from './TextFile.js';

export interface IO {
    readFile(url: URL): Promise<TextFile>;
    writeFile(file: TextFile): Promise<TextFileRef>;
}
