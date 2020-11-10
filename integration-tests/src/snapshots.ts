import * as fs from 'fs';
import * as Path from 'path';
import { Repository } from './configDef';
import * as Shell from 'shelljs';
import * as Diff from 'jest-diff';

export const snapshotDir = Path.resolve(Path.join(__dirname, '..', 'snapshots'));
const snapshotFileName = 'snapshot.txt';

export function writeSnapshot(rep: Repository, output: string) {
    const dir = Path.join(snapshotDir, rep.path);
    const filename = Path.join(dir, snapshotFileName);
    Shell.mkdir('-p', dir);

    const text = prepareOutput(rep, output);

    fs.writeFileSync(filename, text);
}

export interface SnapshotCompareResult {
    match: boolean;
    diff?: string;
}

export function checkAgainstSnapshot(rep: Repository, output: string, update: boolean): SnapshotCompareResult {
    if (update) {
        writeSnapshot(rep, output);
        return { match: true };
    }

    const text = prepareOutput(rep, output);
    const lines = text.split(/\n/g);
    const cleanText = linesToCleanText(lines);

    const snapText = readSnapshot(rep);
    const snapLines = snapText.split(/\n/g);
    const cleanSnapText = linesToCleanText(snapLines);

    if (cleanText !== cleanSnapText) {
        const diff = Diff.diffLinesUnified(snapLines, lines, { contextLines: 5, expand: false });
        return { match: false, diff };
    }

    return { match: true };
}

function linesToCleanText(lines: string[]): string {
    return lines
        .map((t) => t.trim())
        .filter((t) => !!t)
        .join('\n');
}

export function readSnapshot(rep: Repository): string {
    const dir = Path.join(snapshotDir, rep.path);
    const filename = Path.join(dir, snapshotFileName);
    try {
        return fs.readFileSync(filename, 'utf-8');
    } catch (e) {
        return '';
    }
}

function prepareOutput(rep: Repository, output: string) {
    const lines = output.split('\n').filter((line) => !!line.trim());
    lines.sort();

    const text = `
Repository: ${rep.path}
Url: "${rep.url}"
Args: ${JSON.stringify(rep.args)}
Lines:
${lines.join('\n')}
`;
    return text;
}
