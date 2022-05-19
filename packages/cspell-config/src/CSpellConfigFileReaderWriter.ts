import { CSpellConfigFile } from './CSpellConfigFile';
import { Deserializer } from './Deserializer';
import { IO } from './IO';

export class CSpellConfigFileReaderWriter {
    constructor(readonly io: IO, readonly deserializers: Deserializer[]) {}

    async readConfig(uri: string): Promise<CSpellConfigFile> {
        const content = await this.io.readFile(uri);

        for (const des of this.deserializers) {
            const config = des(uri, content);
            if (config) {
                return config;
            }
        }

        throw new Error(`Unable to parse config file: "${uri}"`);
    }

    writeConfig(configFile: CSpellConfigFile): Promise<void> {
        const content = configFile.serialize();
        return this.io.writeFile(configFile.uri, content);
    }
}
