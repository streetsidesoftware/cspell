import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { parseCSpellConfigFileJson } from '../CSpellConfigFileJson.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';

function _deserializerCSpellJson(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    if (!isJsonFile(params.url.pathname)) return next(params);

    return parseCSpellConfigFileJson(params);
}

function isJsonFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.json') || pathname.endsWith('.jsonc');
}

export const deserializerCSpellJson: Deserializer = _deserializerCSpellJson;
