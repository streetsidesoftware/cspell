import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileYaml, parseCSpellConfigFileYaml } from '../CSpellConfigFile/CSpellConfigFileYaml.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    return !isYamlFile(params.url.pathname) ? next(params) : parseCSpellConfigFileYaml(params);
}

function isYamlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.yml') || pathname.endsWith('.yaml');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    return !(settings instanceof CSpellConfigFileYaml) ? next(settings) : settings.serialize();
}

export const serializerCSpellYaml: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
