import * as path from 'path';
import { CompileCommonAppOptions } from '../AppOptions';
import { CompileRequest, DictionaryFormats, Target } from '../config';

export function createCompileRequest(sources: string[], options: CompileCommonAppOptions): CompileRequest {
    const { max_depth, maxDepth, experimental = [], split, keepRawCase, useLegacySplitter } = options;

    const targets = calcTargets(sources, options);
    const generateNonStrict = experimental.includes('compounds') || undefined;

    const req: CompileRequest = {
        targets,
        generateNonStrict,
        maxDepth: parseNumber(maxDepth) ?? parseNumber(max_depth),
        split: useLegacySplitter ? 'legacy' : split,
        /**
         * Do not generate lower case / accent free versions of words.
         * @default false
         */
        keepRawCase,
    };

    return req;
}
function calcTargets(sources: string[], options: CompileCommonAppOptions): Target[] {
    const { merge, output = '.', experimental = [] } = options;

    const generateNonStrict = experimental.includes('comp');

    const format = calcFormat(options);

    if (merge) {
        const target: Target = {
            name: merge,
            targetDirectory: output,
            compress: options.compress,
            format,
            sources,
            sort: options.sort,
            trieBase: parseNumber(options.trieBase),
            generateNonStrict,
        };
        return [target];
    }

    const targets: Target[] = sources.map((source) => {
        const name = toTargetName(path.basename(source));
        const target: Target = {
            name,
            targetDirectory: output,
            compress: options.compress,
            format,
            sources: [source],
            sort: options.sort,
            trieBase: parseNumber(options.trieBase),
            generateNonStrict,
        };
        return target;
    });

    return targets;
}
function calcFormat(options: CompileCommonAppOptions): DictionaryFormats {
    return (options.trie4 && 'trie4') || (options.trie3 && 'trie3') || (options.trie && 'trie') || 'plaintext';
}

function toTargetName(sourceFile: string) {
    return path.basename(sourceFile).replace(/((\.txt|\.dic|\.aff|\.trie)(\.gz)?)?$/, '');
}

function parseNumber(s: string | undefined): number | undefined {
    const n = parseInt(s ?? '');
    return isNaN(n) ? undefined : n;
}
