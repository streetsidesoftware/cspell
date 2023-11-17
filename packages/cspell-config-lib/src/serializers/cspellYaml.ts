import type { CSpellConfigFile, ICSpellConfigFile } from '../CSpellConfigFile.js';
import { CSpellConfigFileYaml, parseCSpellConfigFileYaml } from '../CSpellConfigFileYaml.js';
import type { DeserializerNext, DeserializerParams, SerializerMiddleware, SerializerNext } from '../Serializer.js';

function deserializer(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    if (!isYamlFile(params.url.pathname)) return next(params);

    return parseCSpellConfigFileYaml(params);
}

function isYamlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.yml') || pathname.endsWith('.yaml');
}

function serializer(settings: ICSpellConfigFile, next: SerializerNext): string {
    if (!(settings instanceof CSpellConfigFileYaml)) return next(settings);
    return settings.serialize();
}

export const serializerCSpellYaml: SerializerMiddleware = { deserialize: deserializer, serialize: serializer };
