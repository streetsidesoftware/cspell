import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'yaml';

import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';
import { detectIndentAsNum } from './util.js';

function _deserializerCSpellYaml(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    const { url, content } = params;
    if (!isYamlFile(url.pathname)) return next(params);

    const cspell = parse(content) || {};
    if (!cspell || typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${url}`);
    }

    const indent = detectIndentAsNum(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, { indent });
    }

    return new ImplCSpellConfigFile(url, cspell, serialize);
}

function isYamlFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.yml') || pathname.endsWith('.yaml');
}

export const deserializerCSpellYaml: Deserializer = _deserializerCSpellYaml;
