import { opCombine as opPipe, opConcatMap, opFilter, opMap, type Operator } from '@cspell/cspell-pipe/sync';
import {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    FORBID_PREFIX,
    IDENTITY_PREFIX,
    LINE_COMMENT,
    OPTIONAL_COMPOUND_FIX,
} from './constants';
import { Trie } from './trie';
import { normalizeWord, normalizeWordForCaseInsensitive } from './trie-util';
import { buildTrieFast } from './TrieBuilder';

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
     * Tell the parser to automatically create case / accents insensitive forms.
     * @default true
     */
    stripCaseAndAccents: boolean;

    /**
     * Tell the parser to split words
     * @default false
     */
    split: boolean;
}

const _defaultOptions: ParseDictionaryOptions = {
    commentCharacter: LINE_COMMENT,
    optionalCompoundCharacter: OPTIONAL_COMPOUND_FIX,
    compoundCharacter: COMPOUND_FIX,
    forbiddenPrefix: FORBID_PREFIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
    keepExactPrefix: IDENTITY_PREFIX,
    stripCaseAndAccents: true,
    split: false,
};

export const defaultParseDictionaryOptions: ParseDictionaryOptions = Object.freeze(_defaultOptions);

export const cSpellToolDirective = 'cspell-tools:';

export const setOfCSpellDirectiveFlags = ['no-split', 'split', 'keep-case', 'no-keep-case'];

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
    } = _options;

    let { stripCaseAndAccents = _defaultOptions.stripCaseAndAccents, split = _defaultOptions.split } = _options;

    const regExpSplit = /[\s,;]/g;

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
                    case 'keep-case':
                        stripCaseAndAccents = false;
                        break;
                    case 'no-keep-case':
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

    const doNotNormalizePrefix = new Set([forbidden, ignoreCase, keepCase, '"']);

    function removeDoublePrefix(w: string): string {
        return w.startsWith(ignoreCase + ignoreCase) ? w.slice(1) : w;
    }

    function stripKeepCasePrefixAndQuotes(word: string): string {
        word = word.replace(/"(.*)"/, '$1');
        return word[0] === keepCase ? word.slice(1) : word;
    }

    function _normalize(word: string): string {
        return normalizeWord(stripKeepCasePrefixAndQuotes(word));
    }

    function* mapNormalize(word: string) {
        const nWord = _normalize(word);
        const forms = new Set<string>();
        forms.add(nWord);
        if (stripCaseAndAccents && !doNotNormalizePrefix.has(word[0])) {
            for (const n of normalizeWordForCaseInsensitive(nWord)) {
                if (n !== nWord) forms.add(ignoreCase + n);
            }
        }
        yield* forms;
    }

    function* splitWords(words: Iterable<string>): Iterable<string> {
        for (const word of words) {
            if (split) {
                yield* word.split(regExpSplit);
                continue;
            }
            yield word;
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
