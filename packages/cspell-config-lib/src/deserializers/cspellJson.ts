import { Deserializer, DeserializerParams, DeserializerNext } from '../Deserializer';
import { CSpellConfigFile, ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

const isSupportedFormat = /\.jsonc?(?=$|[?#])/;

function _deserializerCSpellJson(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    const { uri, content } = params;
    if (!isSupportedFormat.test(params.uri)) return next(params);

    const cspell = parse(content);
    if (!cspell || typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

export const deserializerCSpellJson: Deserializer = _deserializerCSpellJson;
