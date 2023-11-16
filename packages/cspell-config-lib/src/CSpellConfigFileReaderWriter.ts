import type { ICSpellConfigFile } from './CSpellConfigFile.js';
import { defaultNextDeserializer, defaultNextSerializer } from './defaultNext.js';
import type { IO } from './IO.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from './Serializer.js';
import { toURL } from './util/toURL.js';

export interface CSpellConfigFileReaderWriter {
    readonly io: IO;
    readonly middleware: SerializerMiddleware[];
    readConfig(uri: URL | string): Promise<ICSpellConfigFile>;
    writeConfig(configFile: ICSpellConfigFile): Promise<void>;
}

export class CSpellConfigFileReaderWriterImpl implements CSpellConfigFileReaderWriter {
    constructor(
        readonly io: IO,
        readonly middleware: SerializerMiddleware[],
    ) {}

    async readConfig(uri: URL | string): Promise<ICSpellConfigFile> {
        const url = toURL(uri);
        const content = await this.io.readFile(url);

        let next: DeserializerNext = defaultNextDeserializer;

        const desContent: DeserializerParams = { url, content };

        for (const des of [...this.middleware].reverse()) {
            next = curryDeserialize(des, next);
        }

        return next(desContent);
    }

    serialize(configFile: ICSpellConfigFile): string {
        let next: SerializerNext = defaultNextSerializer;

        for (const des of [...this.middleware].reverse()) {
            next = currySerialize(des, next);
        }

        return next(configFile);
    }

    writeConfig(configFile: ICSpellConfigFile): Promise<void> {
        const content = this.serialize(configFile);
        return this.io.writeFile(configFile.url, content);
    }
}

function curryDeserialize(middle: SerializerMiddleware, next: DeserializerNext): DeserializerNext {
    return (content) => middle.deserialize(content, next);
}

function currySerialize(middle: SerializerMiddleware, next: SerializerNext): SerializerNext {
    return (cfg) => middle.serialize(cfg, next);
}
