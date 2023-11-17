import type { CSpellConfigFile, ICSpellConfigFile } from './CSpellConfigFile.js';
import type { FileLoaderMiddleware } from './FileLoader.js';
import type { IO } from './IO.js';
import { getDeserializer, getLoader, getSerializer } from './middlewareHelper.js';
import type { DeserializerNext, SerializerMiddleware } from './Serializer.js';
import type { TextFileRef } from './TextFile.js';
import { toURL } from './util/toURL.js';

export interface CSpellConfigFileReaderWriter {
    readonly io: IO;
    readonly middleware: SerializerMiddleware[];
    readonly loaders: FileLoaderMiddleware[];
    readConfig(uri: URL | string): Promise<CSpellConfigFile>;
    writeConfig(configFile: CSpellConfigFile): Promise<TextFileRef>;
}

export class CSpellConfigFileReaderWriterImpl implements CSpellConfigFileReaderWriter {
    /**
     * @param io - an optional injectable IO interface. The default is to use the file system.
     * @param deserializers - Additional deserializers to use when reading a config file. The order of the deserializers is
     *    important. The last one in the list will be the first one to be called.
     */
    constructor(
        readonly io: IO,
        readonly middleware: SerializerMiddleware[],
        readonly loaders: FileLoaderMiddleware[] = [],
    ) {}

    readConfig(uri: URL | string): Promise<CSpellConfigFile> {
        const loader = getLoader(this.loaders);
        return loader({ url: toURL(uri), context: { deserialize: this.getDeserializer(), io: this.io } });
    }

    getDeserializer(): DeserializerNext {
        return getDeserializer(this.middleware);
    }

    serialize(configFile: ICSpellConfigFile): string {
        const serializer = getSerializer(this.middleware);
        return serializer(configFile);
    }

    async writeConfig(configFile: ICSpellConfigFile): Promise<TextFileRef> {
        if (configFile.readonly) throw new Error(`Config file is readonly: ${configFile.url.href}`);
        const content = this.serialize(configFile);
        await this.io.writeFile({ url: configFile.url, content });
        return { url: configFile.url };
    }
}
