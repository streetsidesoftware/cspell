import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFilePackageJson, parseCSpellConfigFilePackageJson } from '../CSpellConfigFilePackageJson.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

const isSupportedFormat = /\bpackage\.json$/i;

function deserializer(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    if (!isSupportedFormat.test(params.url.pathname)) return next(params);

    return parseCSpellConfigFilePackageJson(params);
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    if (!(settings instanceof CSpellConfigFilePackageJson)) return next(settings);
    return settings.serialize();
}

export const serializerPackageJson: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
