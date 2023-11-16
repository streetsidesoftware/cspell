import { promises as fs } from 'fs';

import type { CSpellConfigFileReaderWriter } from './CSpellConfigFileReaderWriter.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import type { IO } from './IO.js';
import type { SerializerMiddleware } from './Serializer.js';
import { defaultDeserializers } from './serializers/index.js';

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

function readFile(url: URL): Promise<string> {
    return fs.readFile(url, 'utf-8');
}

function writeFile(url: URL, content: string): Promise<void> {
    return fs.writeFile(url, content);
}
