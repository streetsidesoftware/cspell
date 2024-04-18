import type { CSpellConfigFileReaderWriter } from './CSpellConfigFileReaderWriter.js';
import { CSpellConfigFileReaderWriterImpl } from './CSpellConfigFileReaderWriter.js';
import { defaultIO } from './defaultIO.js';
import type { FileLoaderMiddleware } from './FileLoader.js';
import type { IO } from './IO.js';
import { defaultLoaders } from './loaders/index.js';
import type { SerializerMiddleware } from './Serializer.js';
import { defaultDeserializers } from './serializers/index.js';

/**
 *
 * @param deserializers - Additional deserializers to use when reading a config file. The order of the deserializers is
 *    important. The last one in the list will be the first one to be called.
 * @param io - an optional injectable IO interface. The default it to use the file system.
 * @returns
 */
export function createReaderWriter(
    deserializers: SerializerMiddleware[] = [],
    loaders: FileLoaderMiddleware[] = [],
    io: IO = defaultIO,
): CSpellConfigFileReaderWriter {
    return new CSpellConfigFileReaderWriterImpl(
        io,
        [...defaultDeserializers, ...deserializers],
        [...defaultLoaders, ...loaders],
    );
}
