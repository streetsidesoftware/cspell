import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'smol-toml';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import type { TextFile } from '../TextFile.js';
import { ParseError } from './Errors.js';

export class CSpellConfigFileToml extends ImplCSpellConfigFile {
    constructor(
        readonly url: URL,
        settings: CSpellSettings,
    ) {
        super(url, settings);
    }

    serialize() {
        return stringify(this.settings);
    }

    removeAllComments(): this {
        return this;
    }

    setSchema(schema: string): this {
        this.settings.$schema = schema;
        return this;
    }

    setComment(_field: keyof CSpellSettings, _comment: string, _inline?: boolean): this {
        return this;
    }

    public static parse(file: TextFile): CSpellConfigFileToml {
        try {
            const cspell: CSpellSettings | unknown = parse(file.content);
            if (!isCSpellSettings(cspell)) {
                throw new ParseError(file.url);
            }

            const cfg = new CSpellConfigFileToml(file.url, cspell);
            return cfg;
        } catch (cause) {
            if (cause instanceof ParseError) {
                throw cause;
            }
            throw new ParseError(file.url, undefined, { cause });
        }
    }

    static from(url: URL, settings: CSpellSettings, _indent?: number): CSpellConfigFileToml {
        return new CSpellConfigFileToml(url, settings);
    }
}

export function parseCSpellConfigFileToml(file: TextFile): CSpellConfigFileToml {
    return CSpellConfigFileToml.parse(file);
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}
