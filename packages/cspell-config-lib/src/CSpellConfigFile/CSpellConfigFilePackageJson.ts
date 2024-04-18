import type { CSpellSettings } from '@cspell/cspell-types';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { SerializeSettingsFn } from '../Serializer.js';
import { detectIndent } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';

export class CSpellConfigFilePackageJson extends ImplCSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
        readonly serializer: SerializeSettingsFn,
    ) {
        super(url, settings);
    }

    serialize() {
        return this.serializer(this.settings);
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
        return JSON.stringify(packageJson, undefined, indent) + '\n';
    }

    return new CSpellConfigFilePackageJson(url, cspell, serialize);
}
