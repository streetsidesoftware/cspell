import { Deserializer } from '../Deserializer';
import { ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'yaml';

const isSupportedFormat = /\.ya?ml(?=$|[?#])/;

function _deserializerCSpellYaml(uri: string, content: string): ImplCSpellConfigFile | undefined {
    if (!isSupportedFormat.test(uri)) return undefined;

    const cspell = parse(content) || {};
    if (!cspell || typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, null, indent);
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

export const deserializerCSpellYaml: Deserializer = _deserializerCSpellYaml;
