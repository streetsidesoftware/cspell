import type { ICSpellConfigFile } from './CSpellConfigFile.js';
import type { TextFile } from './TextFile.js';

export interface DeserializerParams extends TextFile {}

export interface DeserializerNext {
    (content: DeserializerParams): ICSpellConfigFile;
}

export interface Deserializer {
    /**
     * If a Deserializer can handle a given request, it returns a CSpellConfigFile, otherwise it calls `next`.
     */
    (params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile;
}
