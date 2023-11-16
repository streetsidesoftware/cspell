import { promises as fs } from 'fs';

import type { CSpellConfigFileReaderWriter } from './CSpellConfigFileReaderWriter.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import type { IO } from './IO.js';
import type { SerializerMiddleware } from './Serializer.js';
import { defaultDeserializers } from './serializers/index.js';
import type { TextFile, TextFileRef } from './TextFile.js';

const defaultIO: IO = {
    readFile,
    writeFile,
};

export function createReaderWriter(
    deserializers: SerializerMiddleware[] = [],
    io: IO = defaultIO,
): CSpellConfigFileReaderWriter {
    return new CSpellConfigFileReaderWriterImpl(io, deserializers.concat(defaultDeserializers));
}

async function readFile(url: URL): Promise<TextFile> {
    const content = await fs.readFile(url, 'utf-8');
    return { url, content };
}

async function writeFile(file: TextFile): Promise<TextFileRef> {
    await fs.writeFile(file.url, file.content);
    return { url: file.url };
}
