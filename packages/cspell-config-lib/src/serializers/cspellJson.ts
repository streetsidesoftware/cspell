import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileJson, parseCSpellConfigFileJson } from '../CSpellConfigFileJson.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    if (!isJsonFile(params.url.pathname)) return next(params);

    return parseCSpellConfigFileJson(params);
}

function isJsonFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.json') || pathname.endsWith('.jsonc');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    if (!(settings instanceof CSpellConfigFileJson)) return next(settings);
    return settings.serialize();
}

export const serializerCSpellJson: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
