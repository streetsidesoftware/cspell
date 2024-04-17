import * as path from 'node:path';

import type { CompileCommonAppOptions } from '../AppOptions.js';
import type { CompileRequest, DictionaryFormats, DictionarySource, FileSource, Target } from '../config/index.js';

export function createCompileRequest(sourceFiles: string[], options: CompileCommonAppOptions): CompileRequest {
    options = { ...options };
    options.maxDepth ??= options.max_depth;

    const { maxDepth, split, keepRawCase, useLegacySplitter } = options;

    const sources: DictionarySource[] = [...sourceFiles, ...(options.listFile || []).map((listFile) => ({ listFile }))];

    const targets = calcTargets(sources, options);

    const req: CompileRequest = {
        targets,
        maxDepth: parseNumber(maxDepth),
        split: useLegacySplitter ? 'legacy' : split,
        /**
         * Do not generate lower case / accent free versions of words.
         * @default false
         */
        keepRawCase,
    };

    return req;
}

function calcTargets(sources: DictionarySource[], options: CompileCommonAppOptions): Target[] {
    const { merge, output = '.', experimental = [] } = options;

    const generateNonStrict = experimental.includes('compound') || undefined;

    // console.log('%o', sources);

    const format = calcFormat(options);
    const sort = (format === 'plaintext' && options.sort) || undefined;

    if (merge) {
        const target: Target = {
            name: merge,
            targetDirectory: output,
            compress: options.compress,
            format,
            sources: sources.map(normalizeSource),
            sort,
            trieBase: parseNumber(options.trieBase),
            generateNonStrict,
        };
        return [target];
    }

    const targets: Target[] = sources.map((source) => {
        const name = toTargetName(baseNameOfSource(source));
        const target: Target = {
            name,
            targetDirectory: output,
            compress: options.compress,
            format,
            sources: [normalizeSource(source)],
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

function baseNameOfSource(source: DictionarySource): string {
    return typeof source === 'string' ? source : isFileSource(source) ? source.filename : source.listFile;
}

function isFileSource(source: DictionarySource): source is FileSource {
    return typeof source !== 'string' && (<FileSource>source).filename !== undefined;
}

function normalizeSource(source: DictionarySource): DictionarySource {
    if (typeof source === 'string') {
        return normalizeSourcePath(source);
    }
    if (isFileSource(source)) return { ...source, filename: normalizeSourcePath(source.filename) };
    return { ...source, listFile: normalizeSourcePath(source.listFile) };
}

function normalizeSourcePath(source: string): string {
    const cwd = process.cwd();
    const rel = path.relative(cwd, source);
    return rel.split('\\').join('/');
}
