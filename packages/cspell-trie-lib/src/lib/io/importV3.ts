import type { BuilderCursor, TrieBuilder } from '../Builder/index.js';
import type { TrieData } from '../TrieData.js';
import { TrieNodeBuilder } from '../TrieNode/TrieNodeBuilder.js';
import type { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { getGlobalPerfTimer } from '../utils/timer.js';

const EOW = '$'; // End of word
const BACK = '<'; // Move up the tree
const EOL = '\n'; // End of Line (ignored)
const LF = '\r'; // Line Feed (ignored)
const REF = '#'; // Start of Reference
const EOR = ';'; // End of Reference
const ESCAPE = '\\';

const specialCharacterMap = new Map([
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\\', '\\\\'],
]);
const characterMap = new Map([...specialCharacterMap].map((a) => [a[1], a[0]]));

const DATA = '__DATA__';

interface ReduceResults {
    cursor: BuilderCursor;
    parser: Reducer | undefined;
}

type Reducer = (acc: ReduceResults, s: string) => ReduceResults;

export function importTrieV3AsTrieRoot(srcLines: string[] | Iterable<string> | string): TrieNodeTrie {
    const builder = new TrieNodeBuilder();
    return importTrieV3WithBuilder(builder, srcLines);
}

export function importTrieV3WithBuilder<T extends TrieData>(
    builder: TrieBuilder<T>,
    srcLines: string[] | Iterable<string> | string
): T {
    const timer = getGlobalPerfTimer();
    const timerStart = timer.start('importTrieV3');
    const dataLines: string[] =
        typeof srcLines === 'string' ? srcLines.split('\n') : Array.isArray(srcLines) ? srcLines : [...srcLines];

    let radix = 16;
    const comment = /^\s*#/;

    function parseHeaderRows(headerRows: string[]) {
        const header = headerRows.slice(0, 2).join('\n');
        const headerReg = /^TrieXv3\nbase=(\d+)$/;
        /* istanbul ignore if */
        if (!headerReg.test(header)) throw new Error('Unknown file format');
        radix = Number.parseInt(header.replace(headerReg, '$1'), 10);
    }

    function findStartOfData(data: string[]): number {
        for (let i = 0; i < data.length; ++i) {
            const line = data[i];
            if (line.includes(DATA)) {
                return i;
            }
        }
        return -1;
    }

    function readHeader(data: string[]) {
        const headerRows: string[] = [];
        for (const hLine of data) {
            const line = hLine.trim();
            if (!line || comment.test(line)) {
                continue;
            }
            if (line === DATA) {
                break;
            }
            headerRows.push(line);
        }
        parseHeaderRows(headerRows);
    }

    const startOfData = findStartOfData(dataLines);
    if (startOfData < 0) {
        throw new Error('Unknown file format');
    }

    readHeader(dataLines.slice(0, startOfData));

    const cursor = builder.getCursor();

    let node: ReduceResults = {
        cursor,
        parser: undefined,
    };

    const parser = parseStream(radix);

    const timerParse = timer.start('importTrieV3.parse');

    for (let i = startOfData + 1; i < dataLines.length; ++i) {
        const line = dataLines[i];
        for (let j = 0; j < line.length; ++j) {
            node = parser(node, line[j]);
        }
    }
    timerParse();
    timerStart();

    return builder.build();
}

function parseStream(radix: number): Reducer {
    function parseReference(acc: ReduceResults, _: string): ReduceResults {
        let ref = '';

        function parser(acc: ReduceResults, s: string): ReduceResults {
            if (s === EOR) {
                const { cursor } = acc;
                const r = parseInt(ref, radix);
                // +1 is used because EOW node was added but not counted.
                cursor.reference(r + 1);
                acc.parser = undefined;
                return acc;
            }
            ref = ref + s;
            return acc;
        }

        acc.parser = parser;
        return acc;
    }

    function parseEscapeCharacter(acc: ReduceResults, _: string): ReduceResults {
        let prev = '';
        const parser = function (acc: ReduceResults, s: string): ReduceResults {
            if (prev) {
                s = characterMap.get(prev + s) || s;
                acc.parser = undefined;
                return parseCharacter(acc, s);
            }
            if (s === ESCAPE) {
                prev = s;
                return acc;
            }
            acc.parser = undefined;
            return parseCharacter(acc, s);
        };
        acc.parser = parser;
        return acc;
    }

    function parseCharacter(acc: ReduceResults, s: string): ReduceResults {
        acc.cursor.insertChar(s);
        acc.parser = undefined;
        return acc;
    }

    function parseEOW(acc: ReduceResults, _: string): ReduceResults {
        acc.parser = parseBack;
        acc.cursor.markEOW();
        // EOW is set on the way out, so it implies a back step.
        acc.cursor.backStep(1);
        return acc;
    }

    const charactersBack = stringToCharSet(BACK + '23456789');
    function parseBack(acc: ReduceResults, s: string): ReduceResults {
        if (!(s in charactersBack)) {
            acc.parser = undefined;
            return parserMain(acc, s);
        }
        const n = s === BACK ? 1 : parseInt(s, 10) - 1;
        acc.cursor.backStep(n);
        acc.parser = parseBack;
        return acc;
    }

    function parseIgnore(acc: ReduceResults, _: string): ReduceResults {
        return acc;
    }

    const parsers = new Map<string, Reducer>([
        [EOW, parseEOW],
        [BACK, parseBack],
        [REF, parseReference],
        [ESCAPE, parseEscapeCharacter],
        [EOL, parseIgnore],
        [LF, parseIgnore],
    ]);

    function parserMain(acc: ReduceResults, s: string): ReduceResults {
        const parser = acc.parser ?? parsers.get(s) ?? parseCharacter;
        return parser(acc, s);
    }
    return parserMain;
}

function stringToCharSet(values: string): Record<string, boolean | undefined> {
    const set: Record<string, boolean | undefined> = Object.create(null);
    const len = values.length;
    for (let i = 0; i < len; ++i) {
        set[values[i]] = true;
    }
    return set;
}
