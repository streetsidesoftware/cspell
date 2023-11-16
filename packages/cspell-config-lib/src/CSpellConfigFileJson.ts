import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

import { ImplCSpellConfigFile } from './CSpellConfigFile.js';
import { detectIndent } from './deserializers/util.js';
import type { Serializer } from './Serializer.js';
import type { TextFile } from './TextFile.js';

export class CSpellConfigFileJson extends ImplCSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
        readonly serializer: Serializer,
    ) {
        super(url, settings);
    }
}

export function parseCSpellConfigFileJson(file: TextFile): CSpellConfigFileJson {
    const cspell: CSpellSettings | unknown = parse(file.content);
    if (!isCSpellSettings(cspell)) {
        throw new Error(`Unable to parse ${file.url}`);
    }

    const indent = detectIndent(file.content);

    function serialize(settings: CSpellSettings) {
        return stringify(settings, null, indent) + '\n';
    }

    return new CSpellConfigFileJson(file.url, cspell, serialize);
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}
