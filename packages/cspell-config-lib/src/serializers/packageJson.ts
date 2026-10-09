import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import {
    CSpellConfigFilePackageJson,
    parseCSpellConfigFilePackageJson,
} from '../CSpellConfigFile/CSpellConfigFilePackageJson.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

const isSupportedFormat = /\bpackage\.json$/i;

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    return !isSupportedFormat.test(params.url.pathname) ? next(params) : parseCSpellConfigFilePackageJson(params);
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    return !(settings instanceof CSpellConfigFilePackageJson) ? next(settings) : settings.serialize();
}

export const serializerPackageJson: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
