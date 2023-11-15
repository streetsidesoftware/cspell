import type { ICSpellConfigFile } from './CSpellConfigFile.js';

export interface DeserializerParams {
    url: URL;
    content: string;
}

export interface DeserializerNext {
    (content: DeserializerParams): ICSpellConfigFile;
}

export interface Deserializer {
    /**
     * If a Deserializer can handle a given request, it returns a CSpellConfigFile, otherwise it calls `next`.
     */
    (params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile;
}
