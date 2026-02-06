import { assert } from '../utils/assert.ts';
import type { AfxDef, AfxRuleRecord, AfxRuleWithId, AfxWordAndRules, PfxRule, SfxRule } from './afxTypes.ts';

/**
 * Parse an Aff file string for affix rules.
 *
 * Example:
 * ```
 * FLAG UTF-8
 *
 * SFX D Y 4
 * SFX D   0     d          e
 * SFX D   y     ied        [^aeiou]y
 * SFX D   0     ed         [^ey]
 * SFX D   0     ed         [aeiou]y
 *
 * SFX S Y 4
 * SFX S   y     ies        [^aeiou]y
 * SFX S   0     s          [aeiou]y
 * SFX S   0     es         [sxzh]
 * SFX S   0     s          [^sxzhy]
 * ```
 */
export function parseAff(aff: string): AfxDef {
    const cursor = new AffSrcCursor(aff.split('\n'));

    let parseWord: ParseWordFn = parseWordSingleLetterRules; // Default to single letter separator

    const rules: AfxRuleRecord = Object.create(null);

    const affDef: AfxDef = {
        rules,
        wordRulesFormat: '',
    };

    for (const line of cursor.lines) {
        const flags = opFlag(line.trim());
        if (flags) {
            parseWord = flags.parseWord || parseWord;
            affDef.wordRulesFormat = flags.wordRulesFormat ?? affDef.wordRulesFormat;
        }
    }

    while (cursor.peekLine() !== undefined) {
        const line = cursor.peekLine()?.trim();
        if (!line) {
            cursor.nextLine();
            continue;
        }
        const [operator] = line.split(/\s+/, 2);

        switch (operator) {
            case 'SFX':
            case 'PFX': {
                const rule = parseAfxRule(cursor, parseWord);
                if (rule) {
                    rules[rule.id] = rule;
                    continue;
                }
                break;
            }
        }

        cursor.nextLine();
    }

    return affDef;
}

function parseWordSingleLetterRules(word: string): AfxWordAndRules {
    const afxWord: AfxWordAndRules = { word };
    if (!word.includes('/')) return afxWord;
    const [w, rest] = word.split('/', 2);
    afxWord.word = w;
    const [rules] = rest.split(/\s+/g, 1);
    afxWord.apply = [...rules];
    return afxWord;
}

function parseWordLongRules(word: string): AfxWordAndRules {
    const afxWord: AfxWordAndRules = { word };
    if (!word.includes('/')) return afxWord;
    const [w, rest] = word.split('/', 2);
    afxWord.word = w;
    const [rules] = rest.split(/\s+/g, 1);
    afxWord.apply = [...rules.matchAll(/../gu)].filter((r) => r).map((r) => r[0]);
    return afxWord;
}

function parseWordCommaRules(word: string): AfxWordAndRules {
    const afxWord: AfxWordAndRules = { word };
    if (!word.includes('/')) return afxWord;
    const [w, rest] = word.split('/', 2);
    afxWord.word = w;
    const [rules] = rest.split(/\s+/g, 1);
    afxWord.apply = rules.split(',').filter((r) => r);
    return afxWord;
}

/**
 * Parse the content of an affix rule from an Aff file.
 *
 * Example:
 * ```
 * SFX S Y 4
 * SFX S   y     ies        [^aeiou]y
 * SFX S   0     s          [aeiou]y
 * SFX S   0     es         [sxzh]
 * SFX S   0     s          [^sxzhy]
 * ```
 * @param content - The content of the affix rule, including the header and mutation lines.
 * @returns a SfxRule or PfxRule, or undefined if the content doesn't match a rule.
 */
export function parseAffRule(
    content: string,
    parseWord: ParseWordFn = parseWordSingleLetterRules,
): SfxRule | PfxRule | undefined {
    const cursor = new AffSrcCursor(content.trim().split('\n'));
    return parseAfxRule(cursor, parseWord);
}

/**
 * Parse the content of an affix rule from an Aff file using a cursor to track the current line.
 *
 * Example:
 * ```
 * SFX S Y 4
 * SFX S   y     ies        [^aeiou]y
 * SFX S   0     s          [aeiou]y
 * SFX S   0     es         [sxzh]
 * SFX S   0     s          [^sxzhy]
 * ```
 * @param cursor - The cursor to read lines from.
 * @returns a SfxRule or PfxRule, or undefined if the content doesn't match a rule.
 */
export function parseAfxRule(cursor: AffSrcCursor, parseWord: ParseWordFn): AfxRuleWithId | undefined {
    const headerLine = cursor.peekLine()?.trim();
    if (!headerLine) return undefined;
    if (!headerLine.startsWith('SFX ') && !headerLine.startsWith('PFX ')) return undefined;

    const [fx, ruleId, combine, _num] = headerLine.split(/\s+/);

    const afxRule: AfxRuleWithId = {
        type: fx === 'SFX' ? 'S' : 'P',
        id: ruleId,
        combinable: combine.toUpperCase() === 'Y',
        mutations: [],
    };

    const mutations = afxRule.mutations;

    for (let line = cursor.nextLine(); line && line.startsWith(fx); line = cursor.nextLine()) {
        const [_fx, id, remove, attachWithRules, match] = line.trim().split(/\s+/);
        if (_fx !== fx || id !== ruleId) break;
        assert(remove, 'Remove part is required');
        assert(attachWithRules, 'Attach part is required');
        assert(match, 'Match part is required');
        const { word: attach, apply } = parseWord(attachWithRules);

        mutations.push({
            remove: remove === '0' ? '' : remove,
            attach: attach === '0' ? '' : attach,
            when: match,
            apply: apply?.length ? apply : undefined,
        });
    }

    return afxRule;
}

class AffSrcCursor {
    lines: string[];
    line: number;
    constructor(lines: string[], line: number = 0) {
        this.lines = lines;
        this.line = line;
    }

    nextLine(): string | undefined {
        if (this.line >= this.lines.length) return undefined;
        return this.lines[++this.line];
    }

    peekLine(): string | undefined {
        return this.lines[this.line];
    }
}

// cspell:ignore aeiou sxzh sxzhy

type ParseWordFn = (word: string) => AfxWordAndRules;

interface FlagSettings {
    parseWord?: ParseWordFn | undefined;
    wordRulesFormat: AfxDef['wordRulesFormat'] | undefined;
}

function opFlag(line: string): FlagSettings | undefined {
    const [operator, flag] = line.split(/\s+/, 3);
    if (operator !== 'FLAG') return undefined;
    if (flag === 'long') {
        return { parseWord: parseWordLongRules, wordRulesFormat: '..' };
    }
    if (flag === 'num') {
        return { parseWord: parseWordCommaRules, wordRulesFormat: ',' };
    }

    return undefined;
}
