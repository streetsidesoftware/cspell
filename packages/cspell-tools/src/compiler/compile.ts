import { pipeAsync, toArray } from '@cspell/cspell-pipe';
import { opAwaitAsync, opMapAsync } from '@cspell/cspell-pipe/operators';
import { opConcatMap, opMap, pipe } from '@cspell/cspell-pipe/sync';
import * as path from 'path';
import { getSystemFeatureFlags } from '../FeatureFlags';
import { CompileRequest, CompileTargetOptions, DictionarySource, FilePath, FileSource, Target } from '../config';
import { isFileListSource, isFilePath, isFileSource } from './configUtils';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { logWithTimestamp } from './logWithTimestamp';
import { ReaderOptions } from './Reader';
import { readTextFile } from './readTextFile';
import { compileTrie, compileWordList } from './wordListCompiler';

getSystemFeatureFlags().register('compound', 'Enable compound dictionary sources.');

interface CompileOptions {
    /**
     * Optional filter function to filter targets.
     */
    filter?: (target: Target) => boolean;
}

export async function compile(request: CompileRequest, options?: CompileOptions): Promise<void> {
    const { targets } = request;

    const rootDir = path.resolve(request.rootDir || '.');

    for (const target of targets) {
        const keep = options?.filter?.(target) ?? true;
        if (!keep) continue;
        await compileTarget(target, request, rootDir);
    }
    logWithTimestamp(`Complete.`);
}

export async function compileTarget(target: Target, options: CompileTargetOptions, rootDir: string): Promise<void> {
    logWithTimestamp(`Start compile: ${target.name}`);

    const { format, sources, trieBase, sort = true } = target;
    const { keepRawCase = false, maxDepth, split = false } = options;
    const legacy = split === 'legacy';
    const splitWords = legacy ? false : split;
    const targetDirectory = path.resolve(rootDir, target.targetDirectory ?? process.cwd());

    const useTrie = format.startsWith('trie');
    const filename = resolveTarget(target.name, targetDirectory, useTrie, target.compress ?? false);
    const experimental = new Set(options.experimental);
    const useAnnotation = (useTrie && format >= 'trie3') || experimental.has('compound');
    const skipNormalization = useAnnotation;
    const readerOptions: ReaderOptions = { maxDepth, useAnnotation };

    const filesToProcessAsync = pipeAsync(
        readSourceList(sources, rootDir),
        opMapAsync((src) => readFileSource(src, readerOptions)),
        opAwaitAsync()
    );
    const filesToProcess: FileToProcess[] = await toArray(filesToProcessAsync);

    const action = useTrie
        ? async (words: Iterable<string>, dst: string) => {
              return compileTrie(words, dst, {
                  skipNormalization,
                  splitWords,
                  keepRawCase,
                  legacy,
                  base: trieBase,
                  sort: false,
                  trie3: format === 'trie3',
                  trie4: format === 'trie4',
              });
          }
        : async (src: Iterable<string>, dst: string) => {
              return compileWordList(src, dst, {
                  splitWords,
                  sort,
                  skipNormalization,
                  keepRawCase,
                  legacy,
              });
          };

    await processFiles(action, filesToProcess, filename);

    logWithTimestamp(`Done compile: ${target.name}`);
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
        })
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

async function readFileSource(fileSource: FileSource, defaultReaderOptions: ReaderOptions): Promise<FileToProcess> {
    const { filename, maxDepth = defaultReaderOptions.maxDepth } = fileSource;
    const { useAnnotation } = defaultReaderOptions;
    const readerOptions: ReaderOptions = { maxDepth, useAnnotation };

    logWithTimestamp(`Reading ${path.basename(filename)}`);
    const words = await streamWordsFromFile(filename, readerOptions);
    logWithTimestamp(`Done reading ${path.basename(filename)}`);
    const f: FileToProcess = {
        src: filename,
        words,
    };
    return f;
}
