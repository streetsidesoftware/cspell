import type { CSpellSettings } from '@cspell/cspell-types';

import type { ICSpellConfigFile } from './CSpellConfigFile.js';
import type { TextFile } from './TextFile.js';

export interface SerializerNext {
    (content: ICSpellConfigFile): string;
}

export interface SerializerReducer {
    /**
     * If a Serializer can handle a given request, it returns a CSpellConfigFile, otherwise it calls `next`.
     */
    (settings: ICSpellConfigFile, next: SerializerNext): string;
}

export type SerializeSettingsFn = (settings: CSpellSettings) => string;

export interface DeserializerParams extends TextFile {}

export interface DeserializerNext {
    (content: DeserializerParams): ICSpellConfigFile;
}

export interface DeserializerReducer {
    /**
     * If a Deserializer can handle a given request, it returns a CSpellConfigFile, otherwise it calls `next`.
     */
    (params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile;
}

export interface SerializerMiddleware {
    serialize: SerializerReducer;
    deserialize: DeserializerReducer;
}
