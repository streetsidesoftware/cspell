import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import { detectIndent } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';

export class CSpellConfigFileJson extends ImplCSpellConfigFile {
    public indent: string | number = 2;

    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
    ) {
        super(url, settings);
    }

    serialize() {
        return stringify(this.settings, null, this.indent) + '\n';
    }

    public static parse(file: TextFile): CSpellConfigFileJson {
        try {
            const cspell: CSpellSettings | unknown = parse(file.content);
            if (!isCSpellSettings(cspell)) {
                throw new ParseError(file.url);
            }

            const indent = detectIndent(file.content);
            const cfg = new CSpellConfigFileJson(file.url, cspell);
            cfg.indent = indent;
            return cfg;
        } catch (cause) {
            if (cause instanceof ParseError) {
                throw cause;
            }
            throw new ParseError(file.url, undefined, { cause });
        }
    }
}

export function parseCSpellConfigFileJson(file: TextFile): CSpellConfigFileJson {
    return CSpellConfigFileJson.parse(file);
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}

class ParseError extends Error {
    constructor(
        readonly url: URL,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message || `Unable to parse ${url}`, options);
    }
}
