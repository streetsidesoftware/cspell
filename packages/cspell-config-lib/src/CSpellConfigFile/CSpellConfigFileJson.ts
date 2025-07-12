import type { CSpellSettings } from '@cspell/cspell-types';
import { parse, stringify } from 'comment-json';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';
import { detectIndent } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';
import { ParseError } from './Errors.js';

export class CSpellConfigFileJson extends ImplCSpellConfigFile {
    public indent: string | number = 2;

    constructor(
        readonly url: URL,
        settings: CSpellSettings,
    ) {
        super(url, settings);
    }

    serialize() {
        return stringify(this.settings, undefined, this.indent) + '\n';
    }

    removeAllComments(): this {
        // comment-json uses symbols for comments, so we need to remove them.
        for (const key of Object.getOwnPropertySymbols(this.settings)) {
            delete this.settings[key as unknown as keyof typeof this.settings];
        }
        Object.assign(this.settings, JSON.parse(JSON.stringify(this.settings)));
        return this;
    }

    setSchema(schema: string): this {
        this.settings.$schema = schema;
        return this;
    }

    setComment(field: keyof CSpellSettings, comment: string, inline?: boolean): this {
        const prefix = inline ? 'after:' : 'before:';
        const symbolKey = Symbol.for(prefix + field);
        const token = {
            type: 'LineComment',
            value: comment,
            inline,
        };
        const settings: Record<symbol, unknown> = this.settings as Record<symbol, unknown>;
        settings[symbolKey] = [token];
        return this;
    }

    public static parse(file: TextFile): CSpellConfigFileJson {
        try {
            const cspell: CSpellSettings | unknown = parseJson(file.content);
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

    static from(url: URL, settings: CSpellSettings, indent: number | string = 2): CSpellConfigFileJson {
        const cfg = new CSpellConfigFileJson(url, settings);
        cfg.indent = indent;
        return cfg;
    }
}

function parseJson(content: string): unknown {
    try {
        return JSON.parse(content);
    } catch {
        return parse(content);
    }
}

export function parseCSpellConfigFileJson(file: TextFile): CSpellConfigFileJson {
    return CSpellConfigFileJson.parse(file);
}

function isCSpellSettings(cfg: unknown): cfg is CSpellSettings {
    return !(!cfg || typeof cfg !== 'object' || Array.isArray(cfg));
}
