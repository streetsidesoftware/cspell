import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'yaml';

import type { CSpellConfigFile } from '../CSpellConfigFile.js';
import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';
import { detectIndentAsNum } from './util.js';

const isSupportedFormat = /\.ya?ml(?=$|[?#])/;

function _deserializerCSpellYaml(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    const { uri, content } = params;
    if (!isSupportedFormat.test(uri)) return next(params);

    const cspell = parse(content) || {};
    if (!cspell || typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndentAsNum(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, { indent });
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

export const deserializerCSpellYaml: Deserializer = _deserializerCSpellYaml;
