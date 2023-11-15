import type { CSpellSettings } from '@cspell/cspell-types';

import type { ICSpellConfigFile } from '../CSpellConfigFile.js';
import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { Deserializer, DeserializerNext, DeserializerParams } from '../Deserializer.js';
import { detectIndent } from './util.js';

const isSupportedFormat = /\bpackage\.json$/i;

function _deserializerPackageJson(params: DeserializerParams, next: DeserializerNext): ICSpellConfigFile {
    const { url: url, content } = params;
    if (!isSupportedFormat.test(url.pathname)) return next(params);

    const packageJson = JSON.parse(content);
    if (!packageJson || typeof packageJson !== 'object' || Array.isArray(packageJson)) {
        throw new Error(`Unable to parse ${url}`);
    }
    packageJson['cspell'] = packageJson['cspell'] || {};
    const cspell = packageJson['cspell'];
    if (typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${url}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        packageJson['cspell'] = settings;
        return JSON.stringify(packageJson, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(url, cspell, serialize);
}

export const deserializerPackageJson: Deserializer = _deserializerPackageJson;
