import * as path from 'node:path';

import type { CompileCommonAppOptions } from '../AppOptions.ts';
import type {
    CompileRequest,
    CompileSourceOptions,
    DictionaryFormats,
    DictionarySource,
    FileSource,
    Target,
} from '../config/index.ts';

export function createCompileRequest(sourceFiles: string[], options: CompileCommonAppOptions): CompileRequest {
    options = { ...options };
    options.maxDepth ??= options.max_depth;

    const sources: DictionarySource[] = [...sourceFiles, ...(options.listFile || []).map((listFile) => ({ listFile }))];

    const targets = calcTargets(sources, options, calcSourceOptions(options));

    const req: CompileRequest = {
        targets,
    };

    return req;
}

function calcSourceOptions(options: CompileCommonAppOptions): CompileSourceOptions {
    const sourceOptions: CompileSourceOptions = {
        maxDepth: parseNumber(options.maxDepth),
        split: options.useLegacySplitter ? 'legacy' : options.split,
    };
    return Object.fromEntries(Object.entries(sourceOptions).filter(([, v]) => v !== undefined));
}

function calcTargets(
    sources: DictionarySource[],
    options: CompileCommonAppOptions,
    sourceOptions: CompileSourceOptions,
): Target[] {
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
            sources: sources.map((source) => normalizeSource(source, sourceOptions)),
            sort,
            trieBase: parseNumber(options.trieBase),
            generateNonStrict,
            replacements: undefined,
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
            sources: [normalizeSource(source, sourceOptions)],
            sort: options.sort,
            trieBase: parseNumber(options.trieBase),
            generateNonStrict,
            replacements: undefined,
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
    const n = Number.parseInt(s ?? '');
    return Number.isNaN(n) ? undefined : n;
}

function baseNameOfSource(source: DictionarySource): string {
    return typeof source === 'string' ? source : isFileSource(source) ? source.filename : source.listFile;
}

function isFileSource(source: DictionarySource): source is FileSource {
    return typeof source !== 'string' && (<FileSource>source).filename !== undefined;
}

function normalizeSource(source: DictionarySource, sourceOptions: CompileSourceOptions): DictionarySource {
    const hasOptions = Object.keys(sourceOptions).length > 0;
    if (typeof source === 'string') {
        const filename = normalizeSourcePath(source);
        return hasOptions ? { filename, ...sourceOptions } : filename;
    }
    if (isFileSource(source)) {
        const { filename, ...rest } = source;
        return { filename: normalizeSourcePath(filename), ...sourceOptions, ...rest };
    }
    const { listFile, ...rest } = source;
    return { listFile: normalizeSourcePath(listFile), ...sourceOptions, ...rest };
}

function normalizeSourcePath(source: string): string {
    const cwd = process.cwd();
    const rel = path.relative(cwd, source);
    return rel.replaceAll('\\', '/');
}
