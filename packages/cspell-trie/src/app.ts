import type * as commander from 'commander';
import * as fs from 'fs-extra';
import { mkdirp } from 'fs-extra';
import * as path from 'path';
import * as Trie from 'cspell-trie-lib';
import type { Sequence } from 'gensequence';
import { genSequence } from 'gensequence';
import * as stream from 'stream';
import * as zlib from 'zlib';

const UTF8: BufferEncoding = 'utf8';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require('../package.json');
const version = packageInfo['version'];
export function run(program: commander.Command, argv: string[]): Promise<commander.Command> {
    program.version(version);

    program
        .command('create <file.txt>')
        .option('-o, --output <file>', 'output file - defaults to stdout')
        .option('-l, --lower_case', 'output in lower case')
        .option(
            '-b, --base <number>',
            'Use base n for reference ids.  Defaults to 32. Common values are 10, 16, 32. Max of 36'
        )
        .description('Generate a file for use with cspell')
        .action(async (filename, options) => {
            const { output: outputFile, lower_case: lowerCase = false, base = 32 } = options;
            notify('Create Trie', !!outputFile);
            const pOutputStream = createWriteStream(outputFile);
            notify(`Generating...`, !!outputFile);
            const lines = await fileToLines(filename);
            const toLower = lowerCase ? (a: string) => a.toLowerCase() : (a: string) => a;

            const wordsRx = lines
                .map(toLower)
                .map((a) => a.trim())
                .filter((a) => !!a);

            notify('Processing Trie');
            const trie = Trie.buildTrie(wordsRx);

            notify('Export Trie');
            const serialStream = stream.Readable.from(Trie.serializeTrie(trie.root, base - 0 || 32));
            const outputStream = await pOutputStream;
            return new Promise((resolve) => {
                serialStream.pipe(outputStream).on('finish', () => resolve());
            });
        });

    program
        .command('reader <file.trie>')
        .option('-o, --output <file>', 'output file - defaults to stdout')
        .description('Read a cspell trie file and output the list of words.')
        .action(async (filename, options) => {
            const { output: outputFile } = options;
            notify('Reading Trie', !!outputFile);
            const pOutputStream = createWriteStream(outputFile);
            const lines = await fileToLines(filename);
            const root = Trie.importTrie(lines);
            const words: Sequence<string> = Trie.iteratorTrieWords(root);
            const outputStream = await pOutputStream;
            return new Promise((resolve) => {
                stream.Readable.from(words.map((a) => a + '\n'))
                    .pipe(outputStream)
                    .on('finish', () => resolve());
            });
        });

    try {
        return program.parseAsync(argv);
    } catch (e) {
        return Promise.reject(e);
    }
}

async function fileToLines(filename: string): Promise<Sequence<string>> {
    const buffer = await fs.readFile(filename);
    const file = (filename.match(/\.gz$/) ? zlib.gunzipSync(buffer) : buffer).toString(UTF8);
    return genSequence(file.split(/\r?\n/));
}

function createWriteStream(filename?: string): Promise<NodeJS.WritableStream> {
    return !filename
        ? Promise.resolve(process.stdout)
        : mkdirp(path.dirname(filename)).then(() => fs.createWriteStream(filename));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notify(message: any, useStdOut = true) {
    if (useStdOut) {
        console.log(message);
    } else {
        console.error(message);
    }
}
