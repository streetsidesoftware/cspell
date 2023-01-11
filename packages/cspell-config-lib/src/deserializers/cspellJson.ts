import type { Deserializer, DeserializerParams, DeserializerNext } from '../Deserializer';
import type { CSpellConfigFile } from '../CSpellConfigFile';
import { ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

const isSupportedFormat = /\.jsonc?(?=$|[?#])/;

function _deserializerCSpellJson(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    const { uri, content } = params;
    if (!isSupportedFormat.test(params.uri)) return next(params);

    const cspell: CSpellSettings | unknown = parse(content);
    if (!isCSpellSettings(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}

export const deserializerCSpellJson: Deserializer = _deserializerCSpellJson;
