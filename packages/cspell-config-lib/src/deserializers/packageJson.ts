import type { Deserializer, DeserializerParams, DeserializerNext } from '../Deserializer';
import type { CSpellConfigFile } from '../CSpellConfigFile';
import { ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import type { CSpellSettings } from '@cspell/cspell-types';

const isSupportedFormat = /package\.json(?=$|[?#])/;

function _deserializerPackageJson(params: DeserializerParams, next: DeserializerNext): CSpellConfigFile {
    const { uri, content } = params;
    if (!isSupportedFormat.test(uri)) return next(params);

    const packageJson = JSON.parse(content);
    if (!packageJson || typeof packageJson !== 'object' || Array.isArray(packageJson)) {
        throw new Error(`Unable to parse ${uri}`);
    }
    packageJson['cspell'] = packageJson['cspell'] || {};
    const cspell = packageJson['cspell'];
    if (typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        packageJson['cspell'] = settings;
        return JSON.stringify(packageJson, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

export const deserializerPackageJson: Deserializer = _deserializerPackageJson;
