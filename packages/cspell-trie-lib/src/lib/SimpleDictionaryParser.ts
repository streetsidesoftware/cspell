import { type Operator, opCombine as opPipe, opConcatMap, opFilter, opMap } from '@cspell/cspell-pipe/sync';

import {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    FORBID_PREFIX,
    IDENTITY_PREFIX,
    LINE_COMMENT,
    OPTIONAL_COMPOUND_FIX,
} from './constants';
import type { Trie } from './trie';
import { buildTrieFast } from './TrieBuilder';
import { normalizeWord, normalizeWordForCaseInsensitive } from './utils/normalizeWord';

export interface ParseDictionaryOptions {
    compoundCharacter: string;
    optionalCompoundCharacter: string;
    forbiddenPrefix: string;
    caseInsensitivePrefix: string;
    /**
     * Start of a single-line comment.
     * @default "#"
     */
    commentCharacter: string;

    /**
     * If word starts with prefix, do not strip case or accents.
     * @default false;
     */
    keepExactPrefix: string;

    /**
     * Tell the parser to automatically create case / accent insensitive forms.
     * @default true
     */
    stripCaseAndAccents: boolean;

    /**
     * Tell the parser to keep non-case/accent version in both forms.
     * @default false
     */
    stripCaseAndAccentsKeepDuplicate: boolean;

    /**
     * Tell the parser to keep non-case/accent version in both forms.
     * @default false
     */
    stripCaseAndAccentsOnForbidden: boolean;

    /**
     * Tell the parser to split into words along spaces.
     * @default false
     */
    split: boolean;

    /**
     * When splitting tells the parser to output both the split and non-split versions of the line.
     * @default false
     */
    splitKeepBoth: boolean;

    /**
     * Specify the separator for splitting words.
     */
    splitSeparator: RegExp | string;
}

const RegExpSplit = /[\s,;]/g;

const _defaultOptions: ParseDictionaryOptions = {
    commentCharacter: LINE_COMMENT,
    optionalCompoundCharacter: OPTIONAL_COMPOUND_FIX,
    compoundCharacter: COMPOUND_FIX,
    forbiddenPrefix: FORBID_PREFIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
    keepExactPrefix: IDENTITY_PREFIX,
    stripCaseAndAccents: true,
    stripCaseAndAccentsKeepDuplicate: false,
    stripCaseAndAccentsOnForbidden: false,
    split: false,
    splitKeepBoth: false,
    splitSeparator: RegExpSplit,
};

export const defaultParseDictionaryOptions: ParseDictionaryOptions = Object.freeze(_defaultOptions);

export const cSpellToolDirective = 'cspell-dictionary:';

export const setOfCSpellDirectiveFlags = ['no-split', 'split', 'generate-alternatives', 'no-generate-alternatives'];

/**
 * Normalizes a dictionary words based upon prefix / suffixes.
 * Case insensitive versions are also generated.
 * @param options - defines prefixes used when parsing lines.
 * @returns words that have been normalized.
 */
export function createDictionaryLineParserMapper(options?: Partial<ParseDictionaryOptions>): Operator<string> {
    const _options = options || _defaultOptions;
    const {
        commentCharacter = _defaultOptions.commentCharacter,
        optionalCompoundCharacter: optionalCompound = _defaultOptions.optionalCompoundCharacter,
        compoundCharacter: compound = _defaultOptions.compoundCharacter,
        caseInsensitivePrefix: ignoreCase = _defaultOptions.caseInsensitivePrefix,
        forbiddenPrefix: forbidden = _defaultOptions.forbiddenPrefix,
        keepExactPrefix: keepCase = _defaultOptions.keepExactPrefix,
        splitSeparator = _defaultOptions.splitSeparator,
        splitKeepBoth = _defaultOptions.splitKeepBoth,
        stripCaseAndAccentsKeepDuplicate = _defaultOptions.stripCaseAndAccentsKeepDuplicate,
        stripCaseAndAccentsOnForbidden = _defaultOptions.stripCaseAndAccentsOnForbidden,
    } = _options;

    let { stripCaseAndAccents = _defaultOptions.stripCaseAndAccents, split = _defaultOptions.split } = _options;

    // console.log('options: %o', options);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isString(line: any | string): line is string {
        return typeof line === 'string';
    }

    function trim(line: string): string {
        return line.trim();
    }

    function removeComments(line: string): string {
        const idx = line.indexOf(commentCharacter);
        if (idx < 0) return line;

        const idxDirective = line.indexOf(cSpellToolDirective, idx);
        if (idxDirective >= 0) {
            const flags = line
                .slice(idxDirective)
                .split(/[\s,;]/g)
                .map((s) => s.trim())
                .filter((a) => !!a);
            for (const flag of flags) {
                switch (flag) {
                    case 'split':
                        split = true;
                        break;
                    case 'no-split':
                        split = false;
                        break;
                    case 'no-generate-alternatives':
                        stripCaseAndAccents = false;
                        break;
                    case 'generate-alternatives':
                        stripCaseAndAccents = true;
                        break;
                }
            }
        }

        return line.slice(0, idx).trim();
    }

    function filterEmptyLines(line: string): boolean {
        return !!line;
    }

    function* mapOptionalPrefix(line: string) {
        if (line[0] === optionalCompound) {
            const t = line.slice(1);
            yield t;
            yield compound + t;
        } else {
            yield line;
        }
    }

    function* mapOptionalSuffix(line: string) {
        if (line.slice(-1) === optionalCompound) {
            const t = line.slice(0, -1);
            yield t;
            yield t + compound;
        } else {
            yield line;
        }
    }

    const doNotNormalizePrefix: Record<string, true | undefined> = Object.create(null);
    [ignoreCase, keepCase, '"'].forEach((prefix) => (doNotNormalizePrefix[prefix] = true));
    if (!stripCaseAndAccentsOnForbidden) {
        doNotNormalizePrefix[forbidden] = true;
    }

    function removeDoublePrefix(w: string): string {
        return w.startsWith(ignoreCase + ignoreCase) ? w.slice(1) : w;
    }

    function stripKeepCasePrefixAndQuotes(word: string): string {
        word = word.replace(/"(.*?)"/g, '$1');
        return word[0] === keepCase ? word.slice(1) : word;
    }

    function _normalize(word: string): string {
        return normalizeWord(stripKeepCasePrefixAndQuotes(word));
    }

    function* mapNormalize(word: string) {
        const nWord = _normalize(word);
        const forms = new Set<string>();
        forms.add(nWord);
        if (stripCaseAndAccents && !(word[0] in doNotNormalizePrefix)) {
            for (const n of normalizeWordForCaseInsensitive(nWord)) {
                (stripCaseAndAccentsKeepDuplicate || n !== nWord) && forms.add(ignoreCase + n);
            }
        }
        yield* forms;
    }

    function* splitWords(lines: Iterable<string>): Iterable<string> {
        for (const line of lines) {
            if (split) {
                const lineEscaped =
                    line.indexOf('"') >= 0
                        ? line.replace(/".*?"/g, (quoted) => ' ' + quoted.replace(/(\s)/g, '\\$1') + ' ')
                        : line;

                const words = splitLine(lineEscaped, splitSeparator);
                yield* words.map((escaped) => escaped.replace(/\\/g, ''));
                if (!splitKeepBoth) continue;
            }
            yield line;
        }
    }

    function* splitLines(paragraphs: Iterable<string>): Iterable<string> {
        for (const paragraph of paragraphs) {
            yield* paragraph.split('\n');
        }
    }

    const processLines = opPipe(
        opFilter(isString),
        splitLines,
        opMap(removeComments),
        splitWords,
        opMap(trim),
        opFilter(filterEmptyLines),
        opConcatMap(mapOptionalPrefix),
        opConcatMap(mapOptionalSuffix),
        opConcatMap(mapNormalize),
        opMap(removeDoublePrefix)
    );

    return processLines;
}

/**
 * Normalizes a dictionary words based upon prefix / suffixes.
 * Case insensitive versions are also generated.
 * @param lines - one word per line
 * @param _options - defines prefixes used when parsing lines.
 * @returns words that have been normalized.
 */
export function parseDictionaryLines(
    lines: Iterable<string> | string,
    options?: Partial<ParseDictionaryOptions>
): Iterable<string> {
    return createDictionaryLineParserMapper(options)(typeof lines === 'string' ? [lines] : lines);
}

export function parseLinesToDictionary(lines: Iterable<string>, options?: Partial<ParseDictionaryOptions>): Trie {
    const _options = mergeOptions(_defaultOptions, options);
    const dictLines = parseDictionaryLines(lines, _options);
    return buildTrieFast([...new Set(dictLines)].sort(), {
        compoundCharacter: _options.compoundCharacter,
        forbiddenWordPrefix: _options.forbiddenPrefix,
        stripCaseAndAccentsPrefix: _options.caseInsensitivePrefix,
    });
}

export function parseDictionary(text: string, options?: Partial<ParseDictionaryOptions>): Trie {
    return parseLinesToDictionary(text.split('\n'), options);
}

// function escapeRegEx(s: string) {
//     return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
// }

function mergeOptions(
    base: ParseDictionaryOptions,
    ...partials: (Partial<ParseDictionaryOptions> | undefined)[]
): ParseDictionaryOptions {
    const opt: ParseDictionaryOptions = { ...base };
    for (const p of partials) {
        if (!p) continue;
        Object.assign(opt, p);
    }
    return opt;
}

const RegExpToEncode = /\\([\s,;])/g;
const RegExpDecode = /<<(%[\da-f]{2})>>/gi;

function encodeLine(line: string): string {
    return line.replace(RegExpToEncode, (_, v) => '<<' + encodeURIComponent(v) + '>>');
}

function decodeLine(line: string): string {
    return line.replace(RegExpDecode, (_, v) => '\\' + decodeURIComponent(v));
}

function splitLine(line: string, regExp: RegExp | string): string[] {
    return encodeLine(line)
        .split(regExp)
        .map((line) => decodeLine(line));
}

export const __testing__ = {
    splitLine,
};
