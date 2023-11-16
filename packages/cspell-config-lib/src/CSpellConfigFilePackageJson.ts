import type { CSpellSettings } from '@cspell/cspell-types';

import { ImplCSpellConfigFile } from './CSpellConfigFile.js';
import { detectIndent } from './deserializers/util.js';
import type { Serializer } from './Serializer.js';
import type { TextFile } from './TextFile.js';

export class CSpellConfigFilePackageJson extends ImplCSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
        readonly serializer: Serializer,
    ) {
        super(url, settings);
    }
}

export function parseCSpellConfigFilePackageJson(file: TextFile): CSpellConfigFilePackageJson {
    const { url, content } = file;
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

    return new CSpellConfigFilePackageJson(url, cspell, serialize);
}
