import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { parseCSpellConfigFileYaml } from '../CSpellConfigFileYaml.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';

function _deserializerCSpellYaml(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    if (!isYamlFile(params.url.pathname)) return next(params);

    return parseCSpellConfigFileYaml(params);
}

function isYamlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.yml') || pathname.endsWith('.yaml');
}

export const deserializerCSpellYaml: Deserializer = _deserializerCSpellYaml;
