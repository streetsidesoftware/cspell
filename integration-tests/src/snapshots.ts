import fs from 'node:fs';
import fsp from 'node:fs/promises';
import * as Path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as Diff from 'jest-diff';
import Shell from 'shelljs';

import type { Repository } from './configDef.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const snapshotDir = Path.resolve(Path.join(__dirname, '..', 'snapshots'));
const snapshotFileName = 'snapshot.txt';
const reportFileName = 'report.yaml';

export function writeSnapshot(rep: Repository, output: string): void {
    const text = prepareOutput(rep, output);
    writeSnapshotRaw(rep.path, snapshotFileName, text);
}

export function writeSnapshotRaw(repPath: string, fileBaseName: string, output: string): void {
    const dir = Path.join(snapshotDir, repPath);
    const filename = Path.join(dir, fileBaseName);
    Shell.mkdir('-p', dir);

    fs.writeFileSync(filename, output);
}

export interface SnapshotCompareResult {
    match: boolean;
    diff?: string;
}

export async function checkAgainstSnapshot(
    rep: Repository,
    output: string,
    update: boolean,
): Promise<SnapshotCompareResult> {
    if (update) {
        writeSnapshot(rep, output);
        return { match: true };
    }

    const text = prepareOutput(rep, output);
    const lines = text.split('\n');
    const cleanText = linesToCleanText(lines);

    const snapText = await readSnapshot(rep);
    const snapLines = snapText.split('\n');
    const cleanSnapText = linesToCleanText(snapLines);

    if (cleanText !== cleanSnapText) {
        const diff = Diff.diffLinesUnified(snapLines, lines, {
            contextLines: 5,
            expand: false,
        });
        return { match: false, diff };
    }

    return { match: true };
}

export async function checkAgainstReportSnapshot(
    rep: Repository,
    originalReport: string,
): Promise<SnapshotCompareResult> {
    const newReport = await readReportSnapshot(rep);
    if (originalReport === newReport) {
        return { match: true };
    }
    const diff = Diff.diffLinesUnified(originalReport.split('\n'), newReport.split('\n'), {
        contextLines: 5,
        expand: false,
    });
    return { match: false, diff };
}

function linesToCleanText(lines: string[]): string {
    return lines
        .map((t) => t.trim())
        .filter((t) => !!t)
        .join('\n');
}

export async function readSnapshot(rep: Repository): Promise<string> {
    const dir = Path.join(snapshotDir, rep.path);
    const filename = Path.join(dir, snapshotFileName);
    try {
        return fsp.readFile(filename, 'utf8');
    } catch {
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

export async function readReportSnapshot(rep: Repository): Promise<string> {
    const dir = Path.join(snapshotDir, rep.path);
    const filename = Path.join(dir, reportFileName);
    try {
        return await fsp.readFile(filename, 'utf8');
    } catch {
        return '';
    }
}

export async function writeReportSnapshot(rep: Repository, report: string): Promise<void> {
    const dir = Path.join(snapshotDir, rep.path);
    const filename = Path.join(dir, reportFileName);
    return fsp.writeFile(filename, report, 'utf8');
}
