import { opCombine, opCombine as opPipe, opFilter, opMap, type Operator } from '@cspell/cspell-pipe/sync';
import { uniqueFilter } from 'hunspell-reader/dist/util';
import { CompileOptions } from './CompileOptions';
import { legacyLineToWords } from './legacyLineToWords';
import { createDictionaryLineParser } from 'cspell-trie-lib';

export function normalizeTargetWords(options: CompileOptions): Operator<string> {
    const lineParser = createDictionaryLineParser({ stripCaseAndAccents: options.generateNonStrict });
    const operations: Operator<string>[] = [
        opFilter<string>((a) => !!a),
        lineParser,
        options.sort ? createInlineBufferedSort() : undefined,
        opFilter<string>(uniqueFilter(10000)),
    ].filter(isDefined);
    return opCombine(...operations);
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}

function createInlineBufferedSort(bufferSize = 1000): (lines: Iterable<string>) => Iterable<string> {
    function* inlineBufferedSort(lines: Iterable<string>): Iterable<string> {
        const buffer: string[] = [];

        for (const line of lines) {
            buffer.push(line);
            if (buffer.length >= bufferSize) {
                buffer.sort();
                yield* buffer;
                buffer.length = 0;
            }
        }

        buffer.sort();
        yield* buffer;
    }

    return inlineBufferedSort;
}

export interface ParseFileOptions {
    /**
     * Preserve case
     * @default true
     */
    keepCase?: boolean;

    /**
     * Tell the parser to split into words along spaces.
     * @default false
     */
    split?: boolean | undefined;

    /**
     * When splitting tells the parser to output both the split and non-split versions of the line.
     * @default false
     */
    splitKeepBoth?: boolean | undefined;

    /**
     * Specify the separator for splitting words.
     */
    splitSeparator?: RegExp | string | undefined;

    /**
     * Use legacy splitting.
     * @default false
     */
    legacy?: boolean;
}

type ParseFileOptionsRequired = Required<ParseFileOptions>;

const commentCharacter = '#';
const regExpSplit = /(?<!\\)[^\p{L}\p{M}'\w-]/giu;

const _defaultOptions: ParseFileOptionsRequired = {
    keepCase: true,
    legacy: false,
    split: false,
    splitKeepBoth: false,
    splitSeparator: regExpSplit,
};

export const defaultParseDictionaryOptions: ParseFileOptionsRequired = Object.freeze(_defaultOptions);

export const cSpellToolDirective = 'cspell-tools:';

export const setOfCSpellDirectiveFlags = ['no-split', 'split', 'keep-case', 'no-keep-case', 'legacy'];

/**
 * Normalizes a dictionary words based upon prefix / suffixes.
 * Case insensitive versions are also generated.
 * @param options - defines prefixes used when parsing lines.
 * @returns words that have been normalized.
 */
export function createParseFileLineMapper(options?: Partial<ParseFileOptions>): Operator<string> {
    const _options = options || _defaultOptions;
    const { splitSeparator = _defaultOptions.splitSeparator, splitKeepBoth = _defaultOptions.splitKeepBoth } = _options;

    let { legacy = _defaultOptions.legacy } = _options;

    let { split = _defaultOptions.split, keepCase = legacy ? false : _defaultOptions.keepCase } = _options;

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
                        keepCase = true;
                        legacy = false;
                        break;
                    case 'no-keep-case':
                        keepCase = false;
                        break;
                    case 'legacy':
                        keepCase = false;
                        legacy = true;
                        break;
                }
            }
        }

        return line.slice(0, idx).trim();
    }

    function filterEmptyLines(line: string): boolean {
        return !!line;
    }

    function* splitWords(lines: Iterable<string>): Iterable<string> {
        for (const line of lines) {
            if (legacy) {
                yield* legacyLineToWords(line, keepCase);
                continue;
            }
            if (split) {
                const lineEscaped =
                    line.indexOf('"') >= 0
                        ? line.replace(/".*?"/g, (quoted) => ' ' + quoted.replace(/(\s)/g, '\\$1') + ' ')
                        : line;
                const words = lineEscaped.split(splitSeparator);
                yield* words.map((escaped) => escaped.replace(/\\(\s)/g, '$1'));
                if (!splitKeepBoth) continue;
            }
            yield line.replace(/["]/g, '');
        }
    }

    function* unique(lines: Iterable<string>): Iterable<string> {
        const known = new Set<string>();
        for (const line of lines) {
            if (known.has(line)) continue;
            known.add(line);
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
        unique
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
export function parseFileLines(
    lines: Iterable<string> | string,
    options?: Partial<ParseFileOptions>
): Iterable<string> {
    return createParseFileLineMapper(options)(typeof lines === 'string' ? [lines] : lines);
}
