import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { isDefined } from '../util/index.js';
import { calcFileChecksum, checkFile } from './checksum.js';

export interface CheckShasumFileResult {
    filename: string;
    passed: boolean;
    error?: Error;
}

export async function shasumFile(filename: string, root: string | undefined): Promise<string> {
    try {
        const file = resolve(root || '.', filename);
        const checksum = await calcFileChecksum(file);
        return `${checksum}  ${filename}`;
    } catch (error) {
        // const err = toError(error);
        return Promise.reject(`shasum: ${filename}: Unable to read file.`);
    }
}

/**
 *
 * @param filename - name of checksum file
 * @param files - optional list of files to check
 * @param root - optional root, default cwd.
 */
export async function checkShasumFile(
    filename: string,
    files: string[] | undefined,
    root?: string
): Promise<CheckShasumFileResult[]> {
    files = !files ? files : files.length ? files : undefined;
    const shaFiles = await readAndParseShasumFile(filename);
    const filesToCheck = !files ? shaFiles.map(({ filename }) => filename) : files;
    const mapNameToChecksum = new Map(shaFiles.map((r) => [r.filename, r.checksum] as const));
    const resolvedRoot = resolve(root || '.');

    const results: CheckShasumFileResult[] = await Promise.all(
        filesToCheck.map((filename) => {
            return tryToCheckFile(filename, resolvedRoot, mapNameToChecksum.get(filename));
        })
    );

    return results;
}

async function tryToCheckFile(
    filename: string,
    root: string,
    checksum: string | undefined
): Promise<CheckShasumFileResult> {
    if (!checksum) {
        return { filename, passed: false, error: Error('Missing Checksum.') };
    }

    const file = resolve(root, filename);
    try {
        const passed = await checkFile(checksum, file);
        return { filename, passed };
    } catch (error) {
        return { filename, passed: false, error: Error('Failed to read file.') };
    }
}

export interface ChecksumEntry {
    filename: string;
    checksum: string;
    lineNumber: number;
}

const regLine = /([a-f0-9]{40,}) {2}(.*)/;

export async function readAndParseShasumFile(filename: string): Promise<ChecksumEntry[]> {
    const content = await readFile(resolve(filename), 'utf8');
    const shaFiles = parseShasumFile(content);
    return shaFiles;
}

export function parseShasumFile(content: string): ChecksumEntry[] {
    const lines = content.split(/\r?\n|\r/g);

    return lines.map(parseLine).filter(isDefined);

    function parseLine(line: string, index: number): ChecksumEntry | undefined {
        const m = line.match(regLine);
        const lineNumber = index + 1;
        if (!m) {
            if (line.trim()) {
                throw new Error(`Failed to parse line ${lineNumber} of checksum file.`);
            }
            return undefined;
        }
        const checksum = m[1];
        const filename = m[2];
        return { checksum, filename, lineNumber };
    }
}

interface ReportResult {
    report: string;
    passed: boolean;
}

export async function reportChecksumForFiles(files: string[], root: string | undefined): Promise<ReportResult> {
    let numFailed = 0;
    const result = await Promise.all(
        files.map((file) =>
            shasumFile(file, root).catch((e) => {
                ++numFailed;
                if (typeof e !== 'string') throw e;
                return e;
            })
        )
    );
    const report = result.join('\n');
    const passed = !numFailed;
    return { report, passed };
}

export async function reportCheckChecksumFile(
    filename: string,
    files: string[] | undefined,
    root: string | undefined
): Promise<ReportResult> {
    const result = await checkShasumFile(filename, files, root);
    const lines = result.map(({ filename, passed, error }) =>
        `${filename}: ${passed ? 'OK' : 'FAILED'} ${error ? '- ' + error.message : ''}`.trim()
    );
    const withErrors = result.filter((a) => !a.passed);
    const passed = !withErrors.length;
    if (!passed) {
        lines.push(
            `shasum: WARNING: ${withErrors.length} computed checksum${withErrors.length > 1 ? 's' : ''} did NOT match`
        );
    }
    return { report: lines.join('\n'), passed };
}
