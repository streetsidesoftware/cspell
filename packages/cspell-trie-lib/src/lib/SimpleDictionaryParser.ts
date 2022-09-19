import { operators } from 'gensequence';
import { normalizeWord, normalizeWordForCaseInsensitive } from './trie-util';
import {
    COMPOUND_FIX,
    OPTIONAL_COMPOUND_FIX,
    FORBID_PREFIX,
    CASE_INSENSITIVE_PREFIX,
    LINE_COMMENT,
    IDENTITY_PREFIX,
} from './constants';
import { Trie } from './trie';
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
}

const _defaultOptions: ParseDictionaryOptions = {
    commentCharacter: LINE_COMMENT,
    optionalCompoundCharacter: OPTIONAL_COMPOUND_FIX,
    compoundCharacter: COMPOUND_FIX,
    forbiddenPrefix: FORBID_PREFIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
    keepExactPrefix: IDENTITY_PREFIX,
    stripCaseAndAccents: true,
};

export const defaultParseDictionaryOptions: ParseDictionaryOptions = Object.freeze(_defaultOptions);

/**
 * Normalizes a dictionary words based upon prefix / suffixes.
 * Case insensitive versions are also generated.
 * @param lines - one word per line
 * @param _options - defines prefixes used when parsing lines.
 * @returns words that have been normalized.
 */
export function parseDictionaryLines(
    lines: Iterable<string>,
    options?: Partial<ParseDictionaryOptions>
): Iterable<string> {
    const _options = mergeOptions(_defaultOptions, options);
    const {
        commentCharacter,
        optionalCompoundCharacter: optionalCompound,
        compoundCharacter: compound,
        caseInsensitivePrefix: ignoreCase,
        forbiddenPrefix: forbidden,
        keepExactPrefix: keepCase,
        stripCaseAndAccents,
    } = _options;

    const regexComment = new RegExp(escapeRegEx(commentCharacter) + '.*', 'g');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isString(line: any | string): line is string {
        return typeof line === 'string';
    }

    function trim(line: string): string {
        return line.trim();
    }

    function removeComments(line: string): string {
        return line.replace(regexComment, '').trim();
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

    const processLines = operators.pipe(
        operators.filter(isString),
        operators.map(removeComments),
        operators.map(trim),
        operators.filter(filterEmptyLines),
        operators.concatMap(mapOptionalPrefix),
        operators.concatMap(mapOptionalSuffix),
        operators.concatMap(mapNormalize),
        operators.map(removeDoublePrefix)
    );

    return processLines(lines);
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

function escapeRegEx(s: string) {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

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
