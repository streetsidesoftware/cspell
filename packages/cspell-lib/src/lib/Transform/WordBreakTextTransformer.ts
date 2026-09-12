import type { MappedText, SoftWordBreak, WordSegmentationSettings } from '@cspell/cspell-types';

import { escapeRegEx } from '../util/regexHelper.js';
import { regExMatchRegExParts, stringToRegExpOrUndefined } from '../util/textRegex.js';
import { applyEditsToMappedText } from './TextMapEdit.js';
import type { Edit, TextTransformer } from './Transformer.js';
import { softHyphen, toMappedText } from './Transformer.js';

export class SoftWordBreakTextTransformer implements TextTransformer {
    #patterns: RegExp[];

    constructor(settings: WordSegmentationSettings) {
        this.#patterns = compileSoftWordBreakPatterns(settings);
    }

    transform(text: string | MappedText): MappedText {
        const mText = toMappedText(text);
        if (!this.#patterns.length) return mText;
        return applySoftWordBreaks(mText, this.#patterns);
    }

    *transformAll(src: Iterable<string | MappedText>): Iterable<MappedText> {
        for (const item of src) {
            yield this.transform(item);
        }
    }
}

export function createSoftWordBreakTextTransformer(settings: WordSegmentationSettings): TextTransformer {
    return new SoftWordBreakTextTransformer(settings);
}

function compileSoftWordBreakPatterns(settings: WordSegmentationSettings): RegExp[] {
    const enabled = settings.softWordBreaks;
    const definitions = settings.softWordBreakDefinitions;
    if (!enabled || !definitions) return [];

    const patterns: RegExp[] = [];
    for (const name of Object.keys(enabled)) {
        if (!enabled[name]) continue;
        const rule = definitions[name];
        if (!rule) continue;
        for (const part of Array.isArray(rule) ? rule : [rule]) {
            patterns.push(compileSoftWordBreak(part));
        }
    }
    return patterns;
}

function compileSoftWordBreak(rule: SoftWordBreak): RegExp {
    if (rule instanceof RegExp) {
        return new RegExp(rule, rule.flags.includes('g') ? rule.flags : rule.flags + 'g');
    }

    if (regExMatchRegExParts.test(rule)) {
        const regex = stringToRegExpOrUndefined(rule);
        if (!regex) {
            throw new Error(`Invalid soft word break regular expression: "${rule}"`);
        }
        return regex;
    }

    return compileSoftWordBreakPattern(rule);
}

/**
 * Compiles a `SoftWordBreakPattern` string, e.g. `"^ptr|"` or `"before|after$"`, into a
 * zero-width RegExp using lookbehind/lookahead so the matched break position can be located
 * without consuming the surrounding text.
 */
function compileSoftWordBreakPattern(pattern: string): RegExp {
    const pipeIndex = pattern.indexOf('|');
    if (pipeIndex < 0) {
        throw new Error(`Invalid soft word break pattern: "${pattern}"`);
    }

    let before = pattern.slice(0, pipeIndex);
    let after = pattern.slice(pipeIndex + 1);

    const startAnchored = before.startsWith('^');
    if (startAnchored) {
        before = before.slice(1);
    }

    const endAnchored = after.endsWith('$');
    if (endAnchored) {
        after = after.slice(0, -1);
    }

    const lookbehind = startAnchored ? `\\b${escapeRegEx(before)}` : escapeRegEx(before);
    const lookahead = endAnchored ? `${escapeRegEx(after)}\\b` : escapeRegEx(after);

    return new RegExp(`(?<=${lookbehind})(?=${lookahead})`, 'gu');
}

function applySoftWordBreaks(mText: MappedText, patterns: RegExp[]): MappedText {
    const text = mText.text;
    const edits: Edit[] = [];

    for (const pattern of patterns) {
        // Use a fresh RegExp per scan so unrelated calls don't share `lastIndex` state.
        const reg = new RegExp(pattern.source, pattern.flags);
        for (const m of text.matchAll(reg)) {
            const index = m.index;
            const match = m[0];
            const range: Edit['range'] = [index, index + match.length];
            const editText = match ? softHyphen + match + softHyphen : softHyphen;
            edits.push({ text: editText, range });
        }
    }

    if (!edits.length) return mText;

    return applyEditsToMappedText(mText, mergeEdits(edits));
}

function mergeEdits(edits: Edit[]): Edit[] {
    edits.sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1]);
    const merged: Edit[] = [];
    let lastStart = -1;
    let lastEnd = -1;
    for (const edit of edits) {
        if (edit.range[0] < lastEnd) continue;
        if (edit.range[0] === lastStart && edit.range[1] === lastEnd) continue;
        merged.push(edit);
        lastStart = edit.range[0];
        lastEnd = edit.range[1];
    }
    return merged;
}
