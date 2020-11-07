import { operators } from 'gensequence';
import { normalizeWordToLowercase, normalizeWord } from './util';
import { COMPOUND_FIX, OPTIONAL_COMPOUND_FIX, FORBID_PREFIX, CASE_INSENSITIVE_PREFIX, LINE_COMMENT } from './constants';
import { Trie } from './trie';
import { buildTrieFast } from './TrieBuilder';

export interface ParseDictionaryOptions {
    compoundCharacter: string;
    optionalCompoundCharacter: string;
    forbiddenPrefix: string;
    caseInsensitivePrefix: string;
    commentCharacter: string;
}

const _defaultOptions: ParseDictionaryOptions = {
    commentCharacter: LINE_COMMENT,
    optionalCompoundCharacter: OPTIONAL_COMPOUND_FIX,
    compoundCharacter: COMPOUND_FIX,
    forbiddenPrefix: FORBID_PREFIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
};

export const defaultParseDictionaryOptions: ParseDictionaryOptions = Object.freeze(_defaultOptions);

export function parseDictionaryLines(
    lines: Iterable<string>,
    options: ParseDictionaryOptions = _defaultOptions
): Iterable<string> {
    const {
        commentCharacter,
        optionalCompoundCharacter: optionalCompound,
        compoundCharacter: compound,
        caseInsensitivePrefix: ignoreCase,
        forbiddenPrefix: forbidden,
    } = options;

    const regexComment = new RegExp(escapeRegEx(commentCharacter) + '.*', 'g');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function filterLines(line: any | string): line is string {
        return typeof line === 'string';
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

    function* mapNormalize(line: string) {
        yield normalizeWord(line);
        if (line[0] !== forbidden) yield ignoreCase + normalizeWordToLowercase(line);
    }

    const processLines = operators.pipe(
        operators.filter(filterLines),
        operators.map(removeComments),
        operators.filter(filterEmptyLines),
        operators.concatMap(mapOptionalPrefix),
        operators.concatMap(mapOptionalSuffix),
        operators.concatMap(mapNormalize)
    );

    return processLines(lines);
}

export function parseDictionary(text: string, options: ParseDictionaryOptions = _defaultOptions): Trie {
    const lines = parseDictionaryLines(text.split('\n'), options);
    return buildTrieFast([...new Set(lines)].sort(), {
        compoundCharacter: options.compoundCharacter,
        forbiddenWordPrefix: options.forbiddenPrefix,
        stripCaseAndAccentsPrefix: options.caseInsensitivePrefix,
    });
}

function escapeRegEx(s: string) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
