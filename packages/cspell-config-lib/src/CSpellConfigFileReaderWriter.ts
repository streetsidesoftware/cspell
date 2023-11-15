import type { ICSpellConfigFile } from './CSpellConfigFile.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from './Deserializer.js';
import type { IO } from './IO.js';
import { toURL } from './util/toURL.js';

export const defaultNextDeserializer: DeserializerNext = (content: DeserializerParams) => {
    throw new Error(`Unable to parse config file: "${content.url}"`);
};

export interface CSpellConfigFileReaderWriter {
    readonly io: IO;
    readonly deserializers: Deserializer[];
    readConfig(uri: URL | string): Promise<ICSpellConfigFile>;
    writeConfig(configFile: ICSpellConfigFile): Promise<void>;
}

export class CSpellConfigFileReaderWriterImpl implements CSpellConfigFileReaderWriter {
    constructor(
        readonly io: IO,
        readonly deserializers: Deserializer[],
    ) {}

    async readConfig(uri: URL | string): Promise<ICSpellConfigFile> {
        const url = toURL(uri);
        const content = await this.io.readFile(url);

        let next: DeserializerNext = defaultNextDeserializer;

        const desContent: DeserializerParams = { url, content };

        for (const des of [...this.deserializers].reverse()) {
            next = curry(des, next);
        }

        return next(desContent);
    }

    writeConfig(configFile: ICSpellConfigFile): Promise<void> {
        const content = configFile.serialize();
        return this.io.writeFile(configFile.url, content);
    }
}

function curry(des: Deserializer, next: DeserializerNext): DeserializerNext {
    return (content) => des(content, next);
}
