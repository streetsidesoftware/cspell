import { CSpellConfigFile } from './CSpellConfigFile';

export interface Deserializer {
    /**
     * If a Deserializer can handle a given uri, it returns a CSpellConfigFile, otherwise it returns undefined.
     */
    (uri: string, content: string): CSpellConfigFile | undefined;
}
