import { promises as fs } from 'node:fs';

import type { IO } from './IO.js';
import type { TextFile, TextFileRef } from './TextFile.js';

export const defaultIO: IO = {
    readFile,
    writeFile,
};

async function readFile(url: URL): Promise<TextFile> {
    const content = await fs.readFile(url, 'utf8');
    return { url, content };
}

async function writeFile(file: TextFile): Promise<TextFileRef> {
    await fs.writeFile(file.url, file.content);
    return { url: file.url };
}
