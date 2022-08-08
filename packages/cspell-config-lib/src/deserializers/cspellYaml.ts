import { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'yaml';
import { CSpellConfigFile, ImplCSpellConfigFile } from '../CSpellConfigFile';
import { Deserializer, DeserializerParams, DeserializerNext } from '../Deserializer';
import { detectIndentAsNum } from './util';

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
