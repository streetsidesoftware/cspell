import { readFile, writeFile } from 'node:fs/promises';
import { resolve, sep as pathSep } from 'node:path';

import { toError } from '../util/errors.js';
import { isDefined } from '../util/index.js';
import { calcFileChecksum, checkFile } from './checksum.js';

export interface CheckShasumFileResult {
    passed: boolean;
    results: CheckFileResult[];
}

export interface CheckFileResult {
    filename: string;
    passed: boolean;
    error?: Error;
}

export async function shasumFile(filename: string, root: string | undefined): Promise<string> {
    try {
        const file = resolve(root || '.', filename);
        const checksum = await calcFileChecksum(file);
        return `${checksum}  ${filename}`;
    } catch (_) {
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
    root?: string,
): Promise<CheckShasumFileResult> {
    files = !files ? files : files.length ? files : undefined;
    const shaFiles = await readAndParseShasumFile(filename);
    const filesToCheck = !files ? shaFiles.map(({ filename }) => filename) : files;
    const mapNameToChecksum = new Map(shaFiles.map((r) => [normalizeFilename(r.filename), r.checksum] as const));
    const resolvedRoot = resolve(root || '.');

    const results: CheckFileResult[] = await Promise.all(
        filesToCheck.map(normalizeFilename).map((filename) => {
            return tryToCheckFile(filename, resolvedRoot, mapNameToChecksum.get(filename));
        }),
    );

    const passed = !results.find((v) => !v.passed);

    return { passed, results };
}

async function tryToCheckFile(filename: string, root: string, checksum: string | undefined): Promise<CheckFileResult> {
    if (!checksum) {
        return { filename, passed: false, error: Error('Missing Checksum.') };
    }

    const file = resolve(root, filename);
    try {
        const passed = await checkFile(checksum, file);
        return { filename, passed };
    } catch (_) {
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

interface ReportOptions {
    root?: string | undefined;
    listFile?: string[];
}

export async function reportChecksumForFiles(files: string[], options: ReportOptions): Promise<ReportResult> {
    const root = options.root;
    const filesToCheck = await resolveFileList(files, options.listFile);
    let numFailed = 0;
    const result = await Promise.all(
        filesToCheck.map((file) =>
            shasumFile(file, root).catch((e) => {
                ++numFailed;
                if (typeof e !== 'string') throw e;
                return e;
            }),
        ),
    );
    const report = result.join('\n');
    const passed = !numFailed;
    return { report, passed };
}

export async function reportCheckChecksumFile(
    filename: string,
    files: string[] | undefined,
    options: ReportOptions,
): Promise<ReportResult> {
    const root = options.root;
    const filesToCheck = await resolveFileList(files, options.listFile);
    const checkResult = await checkShasumFile(filename, filesToCheck, root);
    const results = checkResult.results;
    const lines = results.map(({ filename, passed, error }) =>
        `${filename}: ${passed ? 'OK' : 'FAILED'} ${error ? '- ' + error.message : ''}`.trim(),
    );
    const withErrors = results.filter((a) => !a.passed);
    const passed = !withErrors.length;
    if (!passed) {
        lines.push(
            `shasum: WARNING: ${withErrors.length} computed checksum${withErrors.length > 1 ? 's' : ''} did NOT match`,
        );
    }
    return { report: lines.join('\n'), passed };
}

async function resolveFileList(files: string[] | undefined, listFile: string[] | undefined): Promise<string[]> {
    files = files || [];
    listFile = listFile || [];

    const setOfFiles = new Set(files);

    const pending = listFile.map((filename) => readFile(filename, 'utf8'));

    for await (const content of pending) {
        content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => a)
            .forEach((file) => setOfFiles.add(file));
    }
    return [...setOfFiles].map(normalizeFilename);
}

export async function calcUpdateChecksumForFiles(
    filename: string,
    files: string[],
    options: ReportOptions,
): Promise<string> {
    const root = options.root || '.';
    const filesToCheck = await resolveFileList(files, options.listFile);
    const currentEntries = (
        await readAndParseShasumFile(filename).catch((err) => {
            const e = toError(err);
            if (e.code !== 'ENOENT') throw e;
            return [] as ChecksumEntry[];
        })
    ).map((entry) => ({ ...entry, filename: normalizeFilename(entry.filename) }));
    const entriesToUpdate = new Set([...filesToCheck, ...currentEntries.map((e) => e.filename)]);
    const mustExist = new Set(filesToCheck);

    const checksumMap = new Map(currentEntries.map(({ filename, checksum }) => [filename, checksum]));

    for (const file of entriesToUpdate) {
        try {
            const checksum = await calcFileChecksum(resolve(root, file));
            checksumMap.set(file, checksum);
        } catch (e) {
            if (mustExist.has(file) || toError(e).code !== 'ENOENT') throw e;
            checksumMap.delete(file);
        }
    }

    const updatedEntries = [...checksumMap]
        .map(([filename, checksum]) => ({ filename, checksum }))
        .sort((a, b) => (a.filename < b.filename ? -1 : 1));
    return updatedEntries.map((e) => `${e.checksum}  ${e.filename}`).join('\n') + '\n';
}

export async function updateChecksumForFiles(
    filename: string,
    files: string[],
    options: ReportOptions,
): Promise<ReportResult> {
    const content = await calcUpdateChecksumForFiles(filename, files, options);

    await writeFile(filename, content);

    return { passed: true, report: content };
}

function normalizeFilename(filename: string): string {
    return filename.split(pathSep).join('/');
}
