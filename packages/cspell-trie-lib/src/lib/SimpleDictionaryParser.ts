import type { Operator } from '@cspell/cspell-pipe/sync';
import { opCombine as opPipe, opConcatMap, opFilter, opMap } from '@cspell/cspell-pipe/sync';

import { buildITrieFromWords } from './buildITrie.ts';
import {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    FORBID_PREFIX,
    IDENTITY_PREFIX,
    LINE_COMMENT,
    OPTIONAL_COMPOUND_FIX,
    SUGGESTION_PREFIX,
    SUGGESTIONS_DISABLED,
} from './constants.ts';
import type { ITrie } from './ITrie.ts';
import type { TrieInfo } from './ITrieNode/TrieInfo.ts';
import { extractTrieInfo } from './ITrieNode/TrieInfo.ts';
import type { Trie } from './trie.ts';
import { buildTrieFast } from './TrieBuilder.ts';
import { normalizeWord, normalizeWordForCaseInsensitive } from './utils/normalizeWord.ts';

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

    /**
     * Do not normalize the compound character.
     */
    keepOptionalCompoundCharacter: boolean;

    /**
     * The character used to denote suggestion prefixes.
     * An empty string or whitespace disables suggestion handling.
     * @default ":"
     */
    suggestionPrefix: string;

    /**
     * Disable suggestion handling. The suggestions prefixes will be treated as normal characters.
     * This will override the `suggestionPrefix` setting.
     * @default false
     */
    disableSuggestionHandling: boolean;

    /**
     * If true, all words will be made forbidden words unless they are already marked as forbidden,
     * in that case they will be made normal words.
     * @default false
     */
    makeWordsForbidden?: boolean;

    /**
     * Optimize the trie for size by merging duplicate sub-tries and using a String Table.
     * @default false
     */
    optimize?: boolean;
}

const RegExpSplit = /[\s,;]/g;

const _defaultOptions = {
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
    keepOptionalCompoundCharacter: false,
    suggestionPrefix: SUGGESTION_PREFIX,
    disableSuggestionHandling: false,
    makeWordsForbidden: false,
} as const satisfies ParseDictionaryOptions;

export const defaultParseDictionaryOptions: ParseDictionaryOptions = Object.freeze(_defaultOptions);

export const cSpellToolDirective = 'cspell-dictionary:';

export const setOfCSpellDirectiveFlags: string[] = [
    'no-split',
    'split',
    'generate-alternatives',
    'no-generate-alternatives',
];

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
        keepOptionalCompoundCharacter = _defaultOptions.keepOptionalCompoundCharacter,
        makeWordsForbidden = _defaultOptions.makeWordsForbidden,
    } = _options;

    let {
        stripCaseAndAccents = !makeWordsForbidden && _defaultOptions.stripCaseAndAccents,
        split = _defaultOptions.split,
        suggestionPrefix = _defaultOptions.suggestionPrefix,
    } = _options;

    const disableSuggestionHandling =
        _options.disableSuggestionHandling || ['', ' ', '\t', '\0'].includes(suggestionPrefix);
    if (disableSuggestionHandling) {
        suggestionPrefix = SUGGESTIONS_DISABLED;
    }

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
                    case 'split': {
                        split = true;
                        break;
                    }
                    case 'no-split': {
                        split = false;
                        break;
                    }
                    case 'no-generate-alternatives': {
                        stripCaseAndAccents = false;
                        break;
                    }
                    case 'generate-alternatives': {
                        stripCaseAndAccents = true;
                        break;
                    }
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
        word = word.replaceAll(/"(.*?)"/g, '$1');
        return word[0] === keepCase ? word.slice(1) : word;
    }

    function _normalize(word: string): string {
        return normalizeWord(stripKeepCasePrefixAndQuotes(word));
    }

    function* handleForbiddenPrefix(words: Iterable<string>): Iterable<string> {
        if (!makeWordsForbidden) {
            yield* words;
            return;
        }
        const f = forbidden;
        const ff = f + f;
        const sug = suggestionPrefix;
        for (const word of words) {
            if (word.startsWith(sug)) {
                yield word;
                continue;
            }
            yield (f + word).replaceAll(ff, '');
        }
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
                const lineEscaped = line.includes('"')
                    ? line.replaceAll(/".*?"/g, (quoted) => ' ' + quoted.replaceAll(/(\s)/g, '\\$1') + ' ')
                    : line;

                const words = splitLine(lineEscaped, splitSeparator);
                yield* words.map((escaped) => escaped.replaceAll('\\', ''));
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

    /**
     * Handle suggestion lines.
     * `:` is the default suggestions prefix.
     *
     * The format can be:
     * - `:word:suggestion1` # word with a single preferred suggestion (note: it is only a suggestion.)
     * - `:word : suggestion1` # word with a single preferred suggestion (space will be removed).
     * - `:word:suggestion1,suggestion2` # word with multiple preferred suggestions
     * - `:word -> suggestion1, suggestion2` # word with multiple preferred suggestions (alternate format)
     * - `:word:suggestion1,suggestion2` # this is purely a suggestion entry.
     * - `!word:suggestion1,suggestion2` # forbidden word with suggestions.
     * - `word:suggestion1,suggestion2` # normal word with suggestions, the word is included in the dictionary.
     *
     * They are stored in the dictionary with the following format:
     *   `<prefix><word><suggestionPrefix><index><suggestionPrefix><suggestion>`
     *
     *
     * Example forbidden word with suggestions:
     * - `!word` the word itself
     * - `!word:0:first_suggestion` the word itself
     * - `!word:1:second_suggestion` the word itself
     * @param lines
     */
    function* handleSuggestions(lines: Iterable<string>): Iterable<string> {
        if (disableSuggestionHandling) {
            yield* lines;
            return;
        }

        for (const line of lines) {
            yield* handleSuggestion(line);
        }
    }

    const r = /^\s*(?<prefix>[!:~]*)(?<word>.*?)(?:->|:([0-9a-f]{1,2}:)?)(?<suggestions>.*)$/;

    const suggestionSequence: Map<string, number> = new Map();
    const knownSuggestions: Set<string> = new Set();

    function addSuggestion(word: string, suggestion: string): string | undefined {
        const p = suggestionPrefix;
        const pp = p + p;
        const n = suggestionSequence.get(word) || 0;
        const k = word + pp + suggestion;
        if (knownSuggestions.has(k)) {
            return undefined;
        }
        knownSuggestions.add(k);
        suggestionSequence.set(word, n + 1);
        return k.replace(pp, p + n.toString(16) + p);
    }

    function* handleSuggestion(line: string): Iterable<string> {
        const hasAltFormat = line.includes('->');
        const hasColon = line.includes(':');
        if (!hasColon && !hasAltFormat) {
            yield line;
            return;
        }
        const m = line.match(r);
        if (!m || !m.groups) {
            yield line;
            return;
        }
        const prefix = m.groups['prefix'] || '';
        const word = (m.groups['word'] || '').trim();
        const suggestionsPart = m.groups['suggestions'] || '';
        const suggestions = suggestionsPart
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s);
        if (!prefix.includes(':')) {
            yield prefix + word;
        }
        const ww = ':' + word;
        yield ww;
        for (let i = 0; i < suggestions.length; i++) {
            const sug = addSuggestion(ww, suggestions[i]);
            if (sug) yield sug;
        }
    }

    const mapCompounds: Operator<string>[] = keepOptionalCompoundCharacter
        ? []
        : [opConcatMap(mapOptionalPrefix), opConcatMap(mapOptionalSuffix)];

    const processLines = opPipe(
        opFilter(isString),
        splitLines,
        opMap(removeComments),
        splitWords,
        opMap(trim),
        opFilter(filterEmptyLines),
        handleSuggestions,
        ...mapCompounds,
        opConcatMap(mapNormalize),
        handleForbiddenPrefix,
        opMap(removeDoublePrefix),
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
    options?: Partial<ParseDictionaryOptions>,
): Iterable<string> {
    return createDictionaryLineParserMapper(options)(typeof lines === 'string' ? [lines] : lines);
}

export function parseLinesToDictionaryLegacy(lines: Iterable<string>, options?: Partial<ParseDictionaryOptions>): Trie {
    const _options = mergeOptions(_defaultOptions, options, { disableSuggestionHandling: true });
    const dictLines = parseDictionaryLines(lines, _options);
    return buildTrieFast([...new Set(dictLines)].sort(), trieInfoFromOptions(options));
}

export function parseDictionaryLegacy(text: string | string[], options?: Partial<ParseDictionaryOptions>): Trie {
    return parseLinesToDictionaryLegacy(typeof text === 'string' ? text.split('\n') : text, options);
}

export function parseLinesToDictionary(lines: Iterable<string>, options?: Partial<ParseDictionaryOptions>): ITrie {
    const _options = mergeOptions(_defaultOptions, options);
    const dictLines = parseDictionaryLines(lines, _options);
    const words = [...new Set(dictLines)].sort();
    return buildITrieFromWords(words, trieInfoFromOptions(options), options?.optimize);
}

export function parseDictionary(text: string | Iterable<string>, options?: Partial<ParseDictionaryOptions>): ITrie {
    return parseLinesToDictionary(typeof text === 'string' ? text.split('\n') : text, options);
}

function trieInfoFromOptions(options: Partial<ParseDictionaryOptions> | undefined): Partial<TrieInfo> {
    const info: Partial<TrieInfo> = extractTrieInfo(options);
    const sugPrefix = info.suggestionPrefix ?? SUGGESTION_PREFIX;
    if (options?.disableSuggestionHandling || sugPrefix !== SUGGESTION_PREFIX) {
        info.suggestionPrefix = SUGGESTIONS_DISABLED;
    }
    return info;
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
    return line.replaceAll(RegExpToEncode, (_, v) => '<<' + encodeURIComponent(v) + '>>');
}

function decodeLine(line: string): string {
    return line.replaceAll(RegExpDecode, (_, v) => '\\' + decodeURIComponent(v));
}

function splitLine(line: string, regExp: RegExp | string): string[] {
    return encodeLine(line)
        .split(regExp)
        .map((line) => decodeLine(line));
}

export const __testing__: {
    splitLine: typeof splitLine;
} = {
    splitLine,
};
