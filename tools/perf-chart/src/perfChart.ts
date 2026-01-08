import { promises as fs } from 'node:fs';
import Path from 'node:path';

import { parse as parseCsv } from 'csv-parse/sync';

import type { CsvRecord, CsvRecordsRO } from './CsvRecord.ts';
import type { Options } from './options.ts';
import { perfReportMd } from './perfChartMD.ts';
import { plotPng } from './plotPng.ts';
import { plotSvg } from './plotSvg.ts';

export async function perfReport(csvFile: string | URL, options: Options): Promise<void> {
    const days = options.days || 30;
    const limitDate = changeDate(new Date(), -days);
    console.error(`Generating performance report from ${csvFile} since ${limitDate.toISOString()}`);
    const rawRecords = await readCsvData(csvFile);
    const records = limitDataToDaysAgo(rawRecords, days);
    // console.error(`Runs in range: ${runsInRange.length}, Records: ${recordsInRange.length}`);
    // _reportOnCsvRecords(recordsInRange);
    // _reportOnCsvRecords(records);
    // console.error(`Found ${records.length} records in the last 30 days. %o`, countCsvRecordsByRepo(records));

    const markdown = perfReportMd(records, options);
    await outputReport(markdown, options);

    const recordsGraph = limitDataToDaysAgo(rawRecords, days * 3);

    await generateSvg(recordsGraph, options);

    await generatePng(recordsGraph, options);
}

function limitDataToDaysAgo(data: CsvRecordsRO, days: number): CsvRecord[] {
    const limitDate = changeDate(new Date(), -days);
    const limitTs = limitDate.getTime();
    const recordsInRange = data.filter((r) => r.platform === 'linux' && r.timestamp >= limitTs);
    const runsInRange = groupCsvRecordsByRun(recordsInRange);
    const runs = filterOutIncompleteRuns(runsInRange);
    const records = runs.flat();
    // console.error(`Runs: ${runs.length}, Records: ${records.length}`);
    return records;
}

async function outputReport(markdown: string, options: Options): Promise<void> {
    if (!options.output) {
        console.log(markdown);
        return;
    }

    await outputFile(options.output, markdown + '\n');
}

async function generateSvg(records: CsvRecord[], options: Options): Promise<void> {
    if (!options.svg) return;

    const svg = plotSvg(records, options);
    await outputFile(options.svg, svg);
}

async function generatePng(records: CsvRecord[], options: Options): Promise<void> {
    if (!options.png) return;

    const buffer = await plotPng(records, options);
    await outputFile(options.png, buffer);
}

async function outputFile(filePath: string, content: string | Buffer): Promise<void> {
    await fs.mkdir(Path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
}

function countCsvRecordsByRepo(records: CsvRecord[], counts: Map<string, number> = new Map()): Map<string, number> {
    for (const r of records) {
        const count = (counts.get(r.repo) || 0) + 1;
        counts.set(r.repo, count);
    }
    return counts;
}

function filterOutIncompleteRuns(runs: CsvRecord[][]): CsvRecord[][] {
    if (runs.length === 0) return runs;

    // Determine the max size.
    const sizes = runs.map((r) => r.length);
    const maxSize = Math.max(...sizes);
    if (sizes.length * maxSize === sizes.reduce((a, b) => a + b, 0)) {
        // All runs are the same size, so we can return them as is.
        return runs;
    }

    const maxDelta = 2;

    // We are going to make a curve that will allow us to filter out runs that are too small.
    // Keep looking while changes are made.
    let changes = false;

    do {
        changes = false;
        for (let i = 0; i < sizes.length; ++i) {
            const max = Math.max(getSize(i - 1), getSize(i + 1));
            const allowed = max - maxDelta;
            if (sizes[i] < allowed) {
                sizes[i] = allowed;
                changes = true;
            }
        }
        for (let i = sizes.length - 1; i >= 0; --i) {
            const max = Math.max(getSize(i - 1), getSize(i + 1));
            const allowed = max - maxDelta;
            if (sizes[i] < allowed) {
                sizes[i] = allowed;
                changes = true;
            }
        }
    } while (changes);

    const result = runs.filter((r, i) => r.length >= sizes[i]);
    return result;

    // Needs to allow for adding new repos and removing old repos.
    // This doesn't happen very often, so we can just filter out runs that are too small.

    function getSize(i: number): number {
        if (i < 0) return sizes[0];
        if (i >= sizes.length) return sizes[sizes.length - 1];
        return sizes[i];
    }
}

function groupCsvRecordsByRun(records: CsvRecordsRO): CsvRecord[][] {
    // Group the csv records by run, that can be determined by the timestamp and
    // the time it took to process the repo with a padding of 1 minute.
    // If a repo record occurs more than once, only the first record is kept.

    const gapPadding = 1 * 60 * 1000; // 2 minutes in milliseconds
    const runs: CsvRecord[][] = [];
    const seen = new Set<string>();
    let run: CsvRecord[] = [];
    let lastTs = 0;
    for (const record of records) {
        const lowerLimit = record.timestamp - record.elapsedMs - gapPadding;
        if (lastTs < lowerLimit) {
            seen.clear();
            run = [];
            runs.push(run);
        }
        if (!seen.has(record.repo)) {
            run.push(record);
            seen.add(record.repo);
        }
        lastTs = record.timestamp;
    }
    return runs;
}

function _reportOnCsvRecords(records: CsvRecordsRO): void {
    // Get a list of all unique repositories.
    const repos = [...new Set(records.map((r) => r.repo))].sort();

    // Group the csv records by run, that can be determined by the timestamp and
    // the time it took to process the repo with a padding of 2 minutes.

    const runs: CsvRecord[][] = groupCsvRecordsByRun(records);

    // Process each run look for duplicates and missing repos entries.
    runs.forEach((run, i) => {
        const runStartTime = Math.min(...run.map((r) => r.timestamp));
        const runEndTime = Math.max(...run.map((r) => r.timestamp));
        const runId = (i + 1).toFixed(0).padStart(2, '0');
        const runRepoNames = new Set(run.map((r) => r.repo));
        const groupedByRepo: Map<string, number> = new Map(repos.map((repo) => [repo, 0]));
        const unexpectedResults = [...countCsvRecordsByRepo(run, groupedByRepo)].filter(([_, count]) => count !== 1);
        console.error(
            `Run ${runId} ${new Date(runStartTime).toISOString()} repos: ${pad(runRepoNames.size, 2)} ${deltaTimeMsInDHMS(runEndTime - runStartTime)} `,
        );
        for (const [repo, count] of unexpectedResults) {
            console.error(`  ${repo.padEnd(20)}: ${count} records`);
        }
    });
}

function deltaTimeMsInDHMS(deltaMs: number): string {
    return deltaTimeSInDHMS(deltaMs / 1000);
}

function pad(s: string | number, n: number): string {
    const t = typeof s === 'number' ? s.toString() : s;
    return n < 0 ? t.padEnd(-n, ' ') : t.padStart(n, ' ');
}

function deltaTimeSInDHMS(deltaSec: number): string {
    const days = Math.floor(deltaSec / (24 * 3600));
    const hours = Math.floor((deltaSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((deltaSec % 3600) / 60);
    const seconds = deltaSec % 60;
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    result += `${seconds.toFixed(2)}s`;
    return result;
}

async function readCsvData(csvFile: string | URL): Promise<CsvRecord[]> {
    const csv = await fs.readFile(csvFile, 'utf8');
    const records = parseCsv(csv, { columns: true, cast: true }) as CsvRecord[];
    return records;
}

function changeDate(date: Date, deltaDays: number): Date {
    const d = new Date(date);
    const n = d.setUTCHours(0, 0, 0, 0);
    const dd = new Date(n + deltaDays * 24 * 60 * 60 * 1000);
    dd.setUTCHours(0, 0, 0, 0);
    return dd;
}
