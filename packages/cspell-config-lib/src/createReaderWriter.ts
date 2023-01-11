import type { CSpellConfigFileReaderWriter } from './CSpellConfigFileReaderWriter';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter';
import { promises as fs } from 'fs';
import type { IO } from './IO';
import type { Deserializer } from './Deserializer';
import { defaultDeserializers } from './deserializers';

const defaultIO: IO = {
    readFile,
    writeFile,
};

export function createReaderWriter(
    deserializers: Deserializer[] = [],
    io: IO = defaultIO
): CSpellConfigFileReaderWriter {
    return new CSpellConfigFileReaderWriterImpl(io, deserializers.concat(defaultDeserializers));
}

function readFile(uriFile: string): Promise<string> {
    const uri = new URL(uriFile);
    return fs.readFile(uri, 'utf-8');
}

function writeFile(uriFile: string, content: string): Promise<void> {
    const uri = new URL(uriFile);
    return fs.writeFile(uri, content);
}
