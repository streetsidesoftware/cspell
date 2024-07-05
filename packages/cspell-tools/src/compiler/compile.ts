import * as path from 'node:path';

import { pipeAsync, toArray } from '@cspell/cspell-pipe';
import { opAwaitAsync, opMapAsync } from '@cspell/cspell-pipe/operators';
import { opConcatMap, opMap, pipe } from '@cspell/cspell-pipe/sync';

import type {
    CompileRequest,
    CompileSourceOptions as CompileSourceConfig,
    CompileTargetOptions as CompileTargetConfig,
    DictionarySource,
    FilePath,
    FileSource,
    Target,
} from '../config/index.js';
import { isFileListSource, isFilePath, isFileSource } from '../config/index.js';
import { checkShasumFile, updateChecksumForFiles } from '../shasum/index.js';
import { createAllowedSplitWordsFromFiles, createWordsCollectionFromFiles } from './createWordsCollection.js';
import { logWithTimestamp } from './logWithTimestamp.js';
import { readTextFile } from './readers/readTextFile.js';
import type { SourceReaderOptions } from './SourceReader.js';
import { streamSourceWordsFromFile } from './streamSourceWordsFromFile.js';
import { compileTrie, compileWordList } from './wordListCompiler.js';
import { normalizeTargetWords } from './wordListParser.js';

interface CompileOptions {
    /**
     * Optional filter function to filter targets.
     */
    filter?: (target: Target) => boolean;

    /**
     * The current working directory. Defaults to process.cwd()
     */
    cwd?: string;

    /**
     * `true` - only build if files do not match checksum.
     */
    conditionalBuild: boolean;
}

export async function compile(request: CompileRequest, options?: CompileOptions): Promise<void> {
    const { targets } = request;

    // console.log('Request: %o', request);

    const rootDir = path.resolve(request.rootDir || '.');
    const cwd = options?.cwd;
    const targetOptions: CompileTargetConfig = {
        sort: request.sort,
        generateNonStrict: request.generateNonStrict,
    };
    const conditional = options?.conditionalBuild || false;
    const checksumFile = resolveChecksumFile(request.checksumFile || conditional, rootDir);
    const dictionaryDirectives = request.dictionaryDirectives;

    const dependencies = new Set<string>();

    for (const target of targets) {
        const keep = options?.filter?.(target) ?? true;
        if (!keep) continue;
        const adjustedTarget: Target = { ...targetOptions, ...target };
        const deps = await compileTarget(adjustedTarget, request, {
            rootDir,
            cwd,
            conditional,
            checksumFile,
            dictionaryDirectives,
        });
        deps.forEach((dep) => dependencies.add(dep));
    }

    if (checksumFile && dependencies.size) {
        logWithTimestamp('%s', `Update checksum: ${checksumFile}`);
        await updateChecksumForFiles(checksumFile, [...dependencies], { root: path.dirname(checksumFile) });
    }

    logWithTimestamp(`Complete.`);

    return;
}

function resolveChecksumFile(checksumFile: string | boolean | undefined, root: string): string | undefined {
    const cFilename =
        (typeof checksumFile === 'string' && checksumFile) || (checksumFile && './checksum.txt') || undefined;
    const file = cFilename && path.resolve(root, cFilename);
    // console.warn('%o', { checksumFile, cFilename, file });
    return file;
}

interface CompileTargetOptions {
    rootDir: string;
    cwd: string | undefined;
    conditional: boolean;
    checksumFile: string | undefined;
    dictionaryDirectives: string[] | undefined;
}

export async function compileTarget(
    target: Target,
    options: CompileSourceConfig,
    compileOptions: CompileTargetOptions,
): Promise<string[]> {
    logWithTimestamp(`Start compile: ${target.name}`);
    const { rootDir, cwd, checksumFile, conditional } = compileOptions;
    const { format, sources, trieBase, sort = true, generateNonStrict = false, excludeWordsFrom } = target;
    const targetDirectory = path.resolve(rootDir, target.targetDirectory ?? cwd ?? process.cwd());
    const dictionaryDirectives = compileOptions.dictionaryDirectives;

    const excludeFilter = await createExcludeFilter(excludeWordsFrom);

    const generateNonStrictTrie = target.generateNonStrict ?? true;

    const name = normalizeTargetName(target.name);

    const useTrie = format.startsWith('trie');
    const filename = resolveTarget(name, targetDirectory, useTrie, target.compress ?? false);

    const filesToProcessAsync = pipeAsync(
        readSourceList(sources, rootDir),
        opMapAsync((src) => readFileSource(src, options)),
        opAwaitAsync(),
    );
    const filesToProcess: FileToProcess[] = await toArray(filesToProcessAsync);
    const normalizer = normalizeTargetWords({
        sort: useTrie || sort,
        generateNonStrict,
        filter: excludeFilter,
        dictionaryDirectives,
    });
    const checksumRoot = (checksumFile && path.dirname(checksumFile)) || rootDir;

    const deps = [...calculateDependencies(filename, filesToProcess, excludeWordsFrom, checksumRoot)];

    if (conditional && checksumFile) {
        const check = await checkShasumFile(checksumFile, deps, checksumRoot).catch(() => undefined);
        if (check?.passed) {
            logWithTimestamp(`Skip ${target.name}, nothing changed.`);
            return [];
        }
    }

    const action = useTrie
        ? async (words: Iterable<string>, dst: string) => {
              return compileTrie(pipe(words, normalizer), dst, {
                  base: trieBase,
                  sort: false,
                  trie3: format === 'trie3',
                  trie4: format === 'trie4',
                  generateNonStrict: generateNonStrictTrie,
                  dictionaryDirectives: undefined,
              });
          }
        : async (words: Iterable<string>, dst: string) => {
              return compileWordList(pipe(words, normalizer), dst, { sort, generateNonStrict, dictionaryDirectives });
          };

    await processFiles(action, filesToProcess, filename);

    logWithTimestamp(`Done compile: ${target.name}`);

    return deps;
}

function calculateDependencies(
    targetFile: string,
    filesToProcess: FileToProcess[],
    excludeFiles: string[] | undefined,
    rootDir: string,
): Set<string> {
    const dependencies = new Set<string>();

    addDependency(targetFile);
    excludeFiles?.forEach((f) => addDependency(f));
    filesToProcess.forEach((f) => addDependency(f.src));

    return dependencies;

    function addDependency(filename: string) {
        const rel = path.relative(rootDir, filename);
        dependencies.add(rel);
        dependencies.add(rel.replace(/\.aff$/, '.dic'));
        dependencies.add(rel.replace(/\.dic$/, '.aff'));
    }
}

function rel(filePath: string): string {
    return path.relative(process.cwd(), filePath);
}

async function processFiles(action: ActionFn, filesToProcess: FileToProcess[], mergeTarget: string) {
    const toProcess = filesToProcess;
    const dst = mergeTarget;

    const words = pipe(
        toProcess,
        opMap((ftp) => {
            const { src } = ftp;
            logWithTimestamp('Process "%s" to "%s"', rel(src), rel(dst));
            return ftp;
        }),
        opConcatMap(function* (ftp) {
            yield* ftp.words;
            logWithTimestamp('Done processing %s', rel(ftp.src));
        }),
        // opMap((a) => (console.warn(a), a))
        logProgress(),
        // opTake(27000000),
    );
    await action(words, dst);
    logWithTimestamp('Done "%s"', rel(dst));
}
interface FileToProcess {
    src: string;
    words: Iterable<string>;
}

type ActionFn = (words: Iterable<string>, dst: string) => Promise<void>;

function resolveTarget(name: string, directory: string, useTrie: boolean, useGzCompress: boolean | boolean): string {
    const ext = ((useTrie && '.trie') || '.txt') + ((useGzCompress && '.gz') || '');
    const filename = name + ext;
    return path.resolve(directory, filename);
}

function readSourceList(sources: DictionarySource[], rootDir: string): AsyncIterable<FileSource> {
    async function* mapSrc(): AsyncIterable<FileSource> {
        for (const src of sources) {
            if (isFilePath(src)) {
                yield { filename: path.resolve(rootDir, src) };
                continue;
            }
            if (isFileSource(src)) {
                yield { ...src, filename: path.resolve(rootDir, src.filename) };
                continue;
            }
            if (isFileListSource(src)) {
                const { listFile, ...rest } = src;
                const absListFile = path.resolve(rootDir, listFile);
                const listFileDir = path.dirname(absListFile);
                const files = await readFileList(absListFile);
                for (const filename of files) {
                    yield { ...rest, filename: path.resolve(listFileDir, filename) };
                }
            }
        }
    }

    return mapSrc();
}

async function readFileList(fileList: FilePath): Promise<string[]> {
    const content = await readTextFile(fileList);
    return content
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a);
}

async function readFileSource(fileSource: FileSource, sourceOptions: CompileSourceConfig): Promise<FileToProcess> {
    const {
        filename,
        keepRawCase = sourceOptions.keepRawCase || false,
        split = sourceOptions.split || false,
        maxDepth,
    } = fileSource;

    const legacy = split === 'legacy';
    const splitWords = legacy ? false : split;

    // console.warn('fileSource: %o,\n targetOptions %o, \n opt: %o', fileSource, targetOptions, opt);

    const allowedSplitWords = await createAllowedSplitWordsFromFiles(
        fileSource.allowedSplitWords || sourceOptions.allowedSplitWords,
    );

    const readerOptions: SourceReaderOptions = {
        maxDepth,
        legacy,
        splitWords,
        keepCase: keepRawCase,
        allowedSplitWords,
    };

    logWithTimestamp(`Reading ${path.basename(filename)}`);
    const stream = await streamSourceWordsFromFile(filename, readerOptions);
    logWithTimestamp(`Done reading ${path.basename(filename)}`);
    const f: FileToProcess = {
        src: filename,
        words: stream,
    };
    return f;
}

function normalizeTargetName(name: string) {
    return name.replace(/((\.txt|\.dic|\.aff|\.trie)(\.gz)?)?$/, '').replaceAll(/[^\p{L}\p{M}.\w\\/-]/gu, '_');
}

function logProgress<T>(freq = 100_000): (iter: Iterable<T>) => Iterable<T> {
    function* logProgress<T>(iter: Iterable<T>): Iterable<T> {
        const _freq = freq;
        let count = 0;
        for (const v of iter) {
            ++count;
            if (!(count % _freq)) {
                logWithTimestamp('Progress: Words Processed - %s', count.toLocaleString());
            }
            yield v;
        }
    }

    return logProgress;
}

async function createExcludeFilter(excludeWordsFrom: FilePath[] | undefined): Promise<(word: string) => boolean> {
    if (!excludeWordsFrom || !excludeWordsFrom.length) return () => true;
    const excludeWords = await createWordsCollectionFromFiles(excludeWordsFrom);
    return (word: string) => !excludeWords.has(word);
}
