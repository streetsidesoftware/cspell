import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';
import { detectIndent } from './util.js';

function _deserializerCSpellJson(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    const { url, content } = params;
    if (!isJsonFile(url.pathname)) return next(params);

    const cspell: CSpellSettings | unknown = parse(content);
    if (!isCSpellSettings(cspell)) {
        throw new Error(`Unable to parse ${url}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(url, cspell, serialize);
}

function isJsonFile(pathname: string) {
    pathname = pathname.toLowerCase();
    return pathname.endsWith('.json') || pathname.endsWith('.jsonc');
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}

export const deserializerCSpellJson: Deserializer = _deserializerCSpellJson;
