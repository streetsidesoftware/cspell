import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileToml, parseCSpellConfigFileToml } from '../CSpellConfigFile/CSpellConfigFileToml.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    if (!isTomlFile(params.url.pathname)) return next(params);

    return parseCSpellConfigFileToml(params);
}

function isTomlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.toml');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    if (!(settings instanceof CSpellConfigFileToml)) return next(settings);
    return settings.serialize();
}

export const serializerCSpellToml: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
