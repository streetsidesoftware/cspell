import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileToml, parseCSpellConfigFileToml } from '../CSpellConfigFile/CSpellConfigFileToml.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    return !isTomlFile(params.url.pathname) ? next(params) : parseCSpellConfigFileToml(params);
}

function isTomlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.toml');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    return !(settings instanceof CSpellConfigFileToml) ? next(settings) : settings.serialize();
}

export const serializerCSpellToml: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
