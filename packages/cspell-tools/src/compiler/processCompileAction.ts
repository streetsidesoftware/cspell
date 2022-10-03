import { compileWordList, compileTrie } from '.';
import * as path from 'path';
import { genSequence, Sequence } from 'gensequence';
import { streamWordsFromFile } from './iterateWordsFromFile';
import { ReaderOptions } from './Reader';
import { CompileCommonOptions } from './CompileOptions';
import { logWithTimestamp } from './logWithTimestamp';
import { globP } from './globP';

export async function processCompileAction(src: string[], options: CompileCommonOptions): Promise<void> {
    const useTrie = options.trie || options.trie3 || options.trie4 || false;
    const fileExt = useTrie ? '.trie' : '.txt';
    console.log(
        'Compile:\n output: %s\n compress: %s\n files:\n  %s \n\n',
        options.output || 'default',
        options.compress ? 'true' : 'false',
        src.join('\n  ')
    );
    const experimental = new Set(options.experimental);
    const skipNormalization = experimental.has('compound');
    const { keepRawCase = false, split: splitWords = false, sort = true, useLegacySplitter: legacy } = options;

    const action = useTrie
        ? async (words: Sequence<string>, dst: string) => {
              return compileTrie(words, dst, {
                  ...options,
                  skipNormalization,
                  splitWords,
                  keepRawCase,
                  legacy,
                  base: parseNumber(options.trieBase),
                  sort: false,
              });
          }
        : async (src: Sequence<string>, dst: string) => {
              return compileWordList(src, dst, {
                  splitWords,
                  sort,
                  skipNormalization,
                  keepRawCase,
                  legacy,
              }).then(() => src);
          };
    const ext = fileExt + (options.compress ? '.gz' : '');
    const maxDepth = parseNumber(options.max_depth);
    const useAnnotation = experimental.has('compound');
    const readerOptions: ReaderOptions = { maxDepth, useAnnotation };

    const globResults = await Promise.all(src.map((s) => globP(s)));
    const filesToProcess = genSequence(globResults)
        .concatMap((files) => files)
        .map(async (filename) => {
            logWithTimestamp(`Reading ${path.basename(filename)}`);
            const words = await streamWordsFromFile(filename, readerOptions);
            logWithTimestamp(`Done reading ${path.basename(filename)}`);
            const f: FileToProcess = {
                src: filename,
                words,
            };
            return f;
        });

    const r = options.merge
        ? processFiles(action, filesToProcess, toMergeTargetFile(options.merge, options.output, ext))
        : processFilesIndividually(action, filesToProcess, (s) => toTargetFile(s, options.output, ext));
    await r;
    logWithTimestamp(`Complete.`);
}
function toFilename(name: string, ext: string) {
    return path.basename(name).replace(/((\.txt|\.dic|\.aff|\.trie)(\.gz)?)?$/, '') + ext;
}
function toTargetFile(filename: string, destination: string | undefined, ext: string) {
    const outFileName = toFilename(filename, ext);
    const dir = destination ?? path.dirname(filename);
    return path.join(dir, outFileName);
}
function toMergeTargetFile(filename: string, destination: string | undefined, ext: string) {
    const outFileName = path.join(path.dirname(filename), toFilename(filename, ext));
    return path.resolve(destination ?? '.', outFileName);
}

async function processFilesIndividually(
    action: ActionFn,
    filesToProcess: Sequence<Promise<FileToProcess>>,
    srcToTarget: (_src: string) => string
) {
    const toProcess = filesToProcess.map(async (pFtp) => {
        const { src, words } = await pFtp;
        const dst = srcToTarget(src);
        logWithTimestamp('Process "%s" to "%s"', src, dst);
        await action(words, dst);
        logWithTimestamp('Done "%s" to "%s"', src, dst);
    });

    for (const p of toProcess) {
        await p;
    }
}

async function processFiles(action: ActionFn, filesToProcess: Sequence<Promise<FileToProcess>>, mergeTarget: string) {
    const toProcess = await Promise.all([...filesToProcess]);
    const dst = mergeTarget;

    const words = genSequence(toProcess)
        .map((ftp) => {
            const { src } = ftp;
            logWithTimestamp('Process "%s" to "%s"', src, dst);
            return ftp;
        })
        .concatMap((ftp) => ftp.words);
    await action(words, dst);
    logWithTimestamp('Done "%s"', dst);
}
interface FileToProcess {
    src: string;
    words: Sequence<string>;
}
function parseNumber(s: string | undefined): number | undefined {
    const n = parseInt(s ?? '');
    return isNaN(n) ? undefined : n;
}
type ActionFn = (words: Sequence<string>, dst: string) => Promise<unknown>;
