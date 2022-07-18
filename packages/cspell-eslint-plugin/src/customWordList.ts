import * as fs from 'fs';
import * as path from 'path';

const sortFn = new Intl.Collator().compare;

export function addWordToCustomWordList(customWordListPath: string, word: string) {
    const content = readFile(customWordListPath) || '\n';
    const lineEndingMatch = content.match(/\r?\n/);
    const lineEnding = lineEndingMatch?.[0] || '\n';
    const words = new Set(
        content
            .split(/\n/g)
            .map((a) => a.trim())
            .filter((a) => !!a)
    );
    words.add(word);

    const lines = [...words];
    lines.sort(sortFn);
    writeFile(customWordListPath, lines.join(lineEnding) + lineEnding);
}

function readFile(file: string): string | undefined {
    try {
        return fs.readFileSync(file, 'utf-8');
    } catch (e) {
        return undefined;
    }
}

function writeFile(file: string, content: string) {
    makeDir(path.dirname(file));
    fs.writeFileSync(file, content);
}

function makeDir(dir: string) {
    try {
        fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
        console.log(e);
    }
}
