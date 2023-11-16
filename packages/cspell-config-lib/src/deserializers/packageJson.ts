import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { parseCSpellConfigFilePackageJson } from '../CSpellConfigFilePackageJson.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';

const isSupportedFormat = /\bpackage\.json$/i;

function _deserializerPackageJson(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    if (!isSupportedFormat.test(params.url.pathname)) return next(params);

    return parseCSpellConfigFilePackageJson(params);
}

export const deserializerPackageJson: Deserializer = _deserializerPackageJson;
