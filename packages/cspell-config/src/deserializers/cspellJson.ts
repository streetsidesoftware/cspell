import { Deserializer } from '../Deserializer';
import { ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

const isSupportedFormat = /\.jsonc?(?=$|[?#])/;

function _deserializerCSpellJson(uri: string, content: string): ImplCSpellConfigFile | undefined {
    if (!isSupportedFormat.test(uri)) return undefined;

    const cspell = parse(content) as unknown;
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
