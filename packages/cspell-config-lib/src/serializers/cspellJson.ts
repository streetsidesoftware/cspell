import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileJson, parseCSpellConfigFileJson } from '../CSpellConfigFile/CSpellConfigFileJson.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    return !isJsonFile(params.url.pathname) ? next(params) : parseCSpellConfigFileJson(params);
}

function isJsonFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.json') || pathname.endsWith('.jsonc');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    return !(settings instanceof CSpellConfigFileJson) ? next(settings) : settings.serialize();
}

export const serializerCSpellJson: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
