import type { ICSpellConfigFile } from './CSpellConfigFile.js';
import type { DeserializerNext, DeserializerParams, SerializerNext } from './Serializer.js';

export const defaultNextDeserializer: DeserializerNext = (content: DeserializerParams) => {
    throw new Error(`Unable to parse config file: "${content.url}"`);
};

export const defaultNextSerializer: SerializerNext = (file: ICSpellConfigFile) => {
    throw new Error(`Unable to serialize config file: "${file.url}"`);
};
