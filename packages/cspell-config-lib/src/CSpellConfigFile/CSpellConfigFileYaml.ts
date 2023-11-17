import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'yaml';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { SerializeSettingsFn } from '../Serializer.js';
import { detectIndentAsNum } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';

export class CSpellConfigFileYaml extends ImplCSpellConfigFile {
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

export function parseCSpellConfigFileYaml(file: TextFile): CSpellConfigFileYaml {
    const { url, content } = file;

    const cspell = parse(content) || {};
    if (!cspell || typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${url}`);
    }

    const indent = detectIndentAsNum(content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, { indent });
    }

    return new CSpellConfigFileYaml(url, cspell, serialize);
}
