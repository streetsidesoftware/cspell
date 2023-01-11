import type { CSpellConfigFile } from './CSpellConfigFile';

export interface DeserializerParams {
    uri: string;
    content: string;
}

export interface DeserializerNext {
    (content: DeserializerParams): CSpellConfigFile;
}

export interface Deserializer {
    /**
     * If a Deserializer can handle a given request, it returns a CSpellConfigFile, otherwise it calls `next`.
     */
    (params: DeserializerParams, next: DeserializerNext): CSpellConfigFile;
}
