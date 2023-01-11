import type { CSpellConfigFile } from './CSpellConfigFile';
import type { Deserializer, DeserializerParams, DeserializerNext } from './Deserializer';
import type { IO } from './IO';

export const defaultNextDeserializer: DeserializerNext = (content: DeserializerParams) => {
    throw new Error(`Unable to parse config file: "${content.uri}"`);
};

export interface CSpellConfigFileReaderWriter {
    readonly io: IO;
    readonly deserializers: Deserializer[];
    readConfig(uri: string): Promise<CSpellConfigFile>;
    writeConfig(configFile: CSpellConfigFile): Promise<void>;
}

export class CSpellConfigFileReaderWriterImpl implements CSpellConfigFileReaderWriter {
    constructor(readonly io: IO, readonly deserializers: Deserializer[]) {}

    async readConfig(uri: string): Promise<CSpellConfigFile> {
        const content = await this.io.readFile(uri);

        let next: DeserializerNext = defaultNextDeserializer;

        const desContent: DeserializerParams = { uri, content };

        for (const des of [...this.deserializers].reverse()) {
            next = curry(des, next);
        }

        return next(desContent);
    }

    writeConfig(configFile: CSpellConfigFile): Promise<void> {
        const content = configFile.serialize();
        return this.io.writeFile(configFile.uri, content);
    }
}

function curry(des: Deserializer, next: DeserializerNext): DeserializerNext {
    return (content) => des(content, next);
}
