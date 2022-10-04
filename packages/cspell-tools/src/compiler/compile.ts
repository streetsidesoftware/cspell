import { pipeAsync, toArray } from '@cspell/cspell-pipe';
import { opAwaitAsync, opMapAsync } from '@cspell/cspell-pipe/operators';
import { opConcatMap, opMap, pipe } from '@cspell/cspell-pipe/sync';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getSystemFeatureFlags } from '../FeatureFlags';
import {
    CompileRequest,
    CompileTargetOptions,
    DictionarySource,
    FilePath,
    FileSource,
    isFileListSource,
    isFilePath,
    isFileSource,
    Target,
} from './config';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { logWithTimestamp } from './logWithTimestamp';
import { ReaderOptions } from './Reader';
import { compileTrie, compileWordList } from './wordListCompiler';

getSystemFeatureFlags().register('compound', 'Enable compound dictionary sources.');

export async function compile(request: CompileRequest): Promise<void> {
    const { targets } = request;

    for (const target of targets) {
        await compileTarget(target, request);
    }
    logWithTimestamp(`Complete.`);
}

export async function compileTarget(target: Target, options: CompileTargetOptions): Promise<void> {
    logWithTimestamp(`Start compile: ${target.filename}`);

    const { format, sources, trieBase, sort = true } = target;
    const { keepRawCase = false, maxDepth, split = false } = options;
    const legacy = split === 'legacy';
    const splitWords = legacy ? false : split;

    const useTrie = format.startsWith('trie');
    const filename = resolveTarget(target.filename, useTrie, target.compress);
    const experimental = new Set(options.experimental);
    const skipNormalization = experimental.has('compound');
    const useAnnotation = experimental.has('compound');
    const readerOptions: ReaderOptions = { maxDepth, useAnnotation };

    const filesToProcessAsync = pipeAsync(
        readSourceList(sources),
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

    logWithTimestamp(`Done compile: ${target.filename}`);
}

async function processFiles(action: ActionFn, filesToProcess: FileToProcess[], mergeTarget: string) {
    const toProcess = filesToProcess;
    const dst = mergeTarget;

    const words = pipe(
        toProcess,
        opMap((ftp) => {
            const { src } = ftp;
            logWithTimestamp('Process "%s" to "%s"', src, dst);
            return ftp;
        }),
        opConcatMap(function* (ftp) {
            yield* ftp.words;
            logWithTimestamp('Done processing %s', ftp.src);
        })
    );
    await action(words, dst);
    logWithTimestamp('Done "%s"', dst);
}
interface FileToProcess {
    src: string;
    words: Iterable<string>;
}

type ActionFn = (words: Iterable<string>, dst: string) => Promise<void>;

function resolveTarget(filename: string, useTrie: boolean, useGzCompress: boolean | boolean): string {
    const ext = ((useTrie && '.trie') || '.txt') + ((useGzCompress && '.gz') || '');
    filename = filename.replace(/((\.txt|\.dic|\.aff|\.trie)(\.gz)?)?$/, '') + ext;
    return path.resolve(filename);
}

function readSourceList(sources: DictionarySource[]): AsyncIterable<FileSource> {
    async function* mapSrc(): AsyncIterable<FileSource> {
        for (const src of sources) {
            if (isFilePath(src)) {
                yield { filename: src };
                continue;
            }
            if (isFileSource(src)) {
                yield src;
                continue;
            }
            if (isFileListSource(src)) {
                const { listFile, ...rest } = src;
                const files = await readFileList(listFile);
                for (const filename of files) {
                    yield { ...rest, filename };
                }
            }
        }
    }

    return mapSrc();
}

async function readFileList(fileList: FilePath): Promise<string[]> {
    const content = await fs.readFile(fileList, 'utf-8');
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
