import { promises as fs } from 'node:fs';

import { parse as parseCsv } from 'csv-parse/sync';
import { calcStandardDeviation, plotPointRelativeToStandardDeviation, simpleHistogram } from 'thistogram';

import { createMdTable, inject } from './text.js';

interface CsvRecord {
    timestamp: number;
    elapsedMs: number;
    repo: string;
    files: number;
    filesWithIssues: number;
    issues: number;
    errors: number;
    platform: string;
    usageUser: number;
    usageSystem: number;
    kilobytes: number | undefined | null;
}

export async function perfReport(csvFile: string | URL): Promise<string> {
    const limit = changeDate(new Date(), -30).getTime();
    console.error(`Generating performance report from ${csvFile} since ${new Date(limit).toISOString()}`);
    const recordsInRange = (await readCsvData(csvFile)).filter((r) => r.platform === 'linux' && r.timestamp >= limit);
    const runsInRange = groupCsvRecordsByRun(recordsInRange);
    const runs = filterOutIncompleteRuns(runsInRange);
    const records = runs.flat();
    // console.error(`Runs in range: ${runsInRange.length}, Records: ${recordsInRange.length}`);
    // reportOnCsvRecords(recordsInRange);
    console.error(`Runs: ${runs.length}, Records: ${records.length}`);
    reportOnCsvRecords(records);
    // console.error(`Found ${records.length} records in the last 30 days. %o`, countCsvRecordsByRepo(records));
    const dailyStats = createDailyStats(records);
    const data = [...groupBy(records, 'repo')].sort((a, b) => a[0].localeCompare(b[0]));
    const markdown = inject`\
        <!---
        # This file is auto-generated. Do not edit.
        # cspell:disable
        --->
        # Performance Report

        ${createDailyPerfGraph(dailyStats)}

        ${createPerfTable1(data)}

        ${createFpsPerfTable(data)}

        ${createThroughputPerfTable(data)}

    `;
    return markdown;
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

function groupCsvRecordsByRun(records: CsvRecord[]): CsvRecord[][] {
    // Groupd the csv records by run, that can be determined by the timestamp and
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

function reportOnCsvRecords(records: CsvRecord[]) {
    // Get a list of all unique repositories.
    const repos = [...new Set(records.map((r) => r.repo))].sort();

    // Groupd the csv records by run, that can be determined by the timestamp and
    // the time it took to process the repo with a padding of 2 minutes.

    const runs: CsvRecord[][] = groupCsvRecordsByRun(records);

    // Process each run look for duplicates and missing repos entries.
    runs.forEach((run, i) => {
        const runStartTime = Math.min(...run.map((r) => r.timestamp));
        const runEndTime = Math.max(...run.map((r) => r.timestamp));
        const runId = (i + 1).toFixed(0).padStart(2, '0');
        const runRepoNames = new Set(run.map((r) => r.repo));
        const groupedByRepo: Map<string, number> = new Map(repos.map((repo) => [repo, 0]));
        const unexpectedResults = [...countCsvRecordsByRepo(run, groupedByRepo)].filter(([_, count]) => count != 1);
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

interface CalcStats {
    point: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    sd: number;
    trend: number[];
}

const emptyStats: CalcStats = { point: 0, avg: 0, min: 0, max: 0, sum: 0, count: 0, sd: 0, trend: [0] };

/**
 * Extract data and calculate min, max, and median
 * The min/max/median values do NOT include the point value.
 * @param data - the perf data.
 * @returns [point, min, max]
 */
function calcStats(data: CsvRecord[], fn: (d: CsvRecord) => number = (d) => d.elapsedMs): CalcStats {
    const values = data.map((d) => fn(d)).map((v) => v || 1);
    const trend = values.slice(-20);
    const point = values.pop();
    if (point === undefined) return emptyStats;
    if (values.length === 0) return { point, avg: point, min: point, max: point, sum: point, count: 1, sd: 0, trend };
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / (values.length || 1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sd = calcStandardDeviation(values);
    return { point, avg, min, max, sum, count: values.length, sd, trend };
}

function groupBy<T, K extends keyof T>(data: T[], key: K): Map<T[K], T[]>;
function groupBy<T, K>(data: T[], fn: (d: T) => K): Map<K, T[]>;
function groupBy<T, K>(data: T[], key: keyof T | ((d: T) => K)): Map<K, T[]> {
    const fn = typeof key === 'function' ? key : (d: T) => d[key] as K;
    const map = new Map<K, T[]>();
    for (const d of data) {
        const k = fn(d);
        const group = map.get(k) || [];
        group.push(d);
        map.set(k, group);
    }
    return map;
}

function changeDate(date: Date, deltaDays: number): Date {
    const d = new Date(date);
    const n = d.setUTCHours(0, 0, 0, 0);
    const dd = new Date(n + deltaDays * 24 * 60 * 60 * 1000);
    dd.setUTCHours(0, 0, 0, 0);
    return dd;
}

function calcAllStats(data: [string, CsvRecord[]][], fn?: (d: CsvRecord) => number): CalcStats[] {
    return data.map(([_, records]) => calcStats(records, fn));
}

function p(s: string, n: number): string {
    return n < 0 ? s.padEnd(-n, ' ') : s.padStart(n, ' ');
}

/**
 * Convert a value in milliseconds to seconds and format it.
 * @param v
 * @param fixed
 */
const s = (v: number, fixed = 3) => (v / 1000).toFixed(fixed);

// function toFixed(v: number, digits = 4): string {
//     const n = Math.max(1, Math.ceil(Math.log10(v || 1)));
//     return v.toFixed(digits - n + 1);
// }
// const sf = (v: number, fixed = 3) => toFixed(v / 1000, fixed);

function createPerfTable1(data: [string, CsvRecord[]][]): string {
    const sp = (v: number, pad = 5, fixed = 1) => p(s(v, fixed), pad);

    const stats = calcAllStats(data);
    const maxRelSd = Math.max(...stats.map((s) => (s.sd * s.sum) / s.count));

    const rows = data.map(([repo], i) => {
        const { point, min, max, sum, count, sd, avg } = stats[i];
        const relSd = (sd * sum) / count;
        const sdGraph = sd
            ? plotPointRelativeToStandardDeviation(
                  point,
                  sd,
                  avg,
                  21,
                  Math.max(2.5 + Math.log(maxRelSd / relSd) / 6, Math.abs(point - avg) / sd),
              )
            : '';
        return [sub(repo), s(point, 2), `${sp(min)} / ${sp(avg)} / ${sp(max)}`, sp(sd, 5, 2), `\`${sdGraph}\``];
    });

    const table = createMdTable({
        header: `
        | Repository | Elapsed | Min/Avg/Max   | SD  | SD Graph  |
        | ---------- | ------: | :-----------: | --: | --------  |
        `,
        rows,
    });

    return inject`
        ## Time to Process Files

        ${table}

        Note:
        - Elapsed time is in seconds.
    `;
}

function createFpsPerfTable(data: [string, CsvRecord[]][]): string {
    const fn = (d: CsvRecord) => (1000 * d.files) / d.elapsedMs;
    const stats = calcAllStats(data, fn);

    const rows = data.map(([repo, records], i) => {
        const { point, count, trend, min, avg } = stats[i];
        // const trendGraph = simpleHistogram(trend, avg - 2 * sd, avg + 3 * sd);
        const trendGraph = simpleHistogram(trend, min * 0.9);
        const relChange = ((100 * (point - avg)) / (avg || 1)).toFixed(2) + '%';
        const lastRecord = records[records.length - 1];
        const fps = fn(lastRecord);
        const elapsed = lastRecord.elapsedMs;
        const nFiles = lastRecord.files.toFixed(0);
        return [sub(repo), nFiles, s(elapsed, 2), fps.toFixed(2), relChange, `\`${trendGraph}\``, count];
    });

    const table = createMdTable({
        header: `
        | Repository | Files | Sec  | Fps  | Rel   | Trend Fps | N     |
        | ---------- | ----: | ---: | ---: | ----: | --------- | ----: |
        `,
        rows,
    });

    return inject`
        ## Files per Second over Time

        ${table}
    `;
}

function createThroughputPerfTable(data: [string, CsvRecord[]][]): string {
    data = data.map(([repo, records]) => [repo, records.filter((r) => r.kilobytes)] as const);

    const fn = (d: CsvRecord) => (1000 * (d.kilobytes || 0)) / d.elapsedMs;

    const stats = calcAllStats(data, fn);

    const rows = data.map(([repo, records], i) => {
        const { point, count, trend, min, avg } = stats[i];
        const trendGraph = simpleHistogram(trend, min * 0.9);
        const relChange = ((100 * (point - avg)) / (avg || 1)).toFixed(2) + '%';
        const lastRecord = records[records.length - 1];
        const mps = fn(lastRecord);
        const elapsed = lastRecord.elapsedMs;
        const nFiles = lastRecord.files.toFixed(0);
        return [sub(repo), nFiles, s(elapsed, 2), mps.toFixed(2), relChange, `\`${trendGraph}\``, count];
    });

    const table = createMdTable({
        header: `
        | Repository | Files | Sec  | Kps  | Rel   | Trend Kps | N     |
        | ---------- | ----: | ---: | ---: | ----: | --------- | ----: |
        `,
        rows,
    });

    return inject`
        ## Data Throughput

        ${table}
    `;
}

interface DailyStats {
    date: Date;
    files: number;
    elapsedSeconds: number;
    fps: number;
    fpsMax: number;
    fpsMin: number;
    fpsP90: number;
    fpsP10: number;
    fpsByRepo: Map<string, number>;
}

// cspell:ignore xychart
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function createDailyPerfGraph(dailyStats: DailyStats[]): string {
    const bar = dailyStats.map((d) => d.fps.toFixed(2));
    const fpsByRepo = groupBy(
        dailyStats.flatMap((d) => [...d.fpsByRepo].map(([repo, fps]) => ({ repo, fps }))),
        'repo',
    );
    const lines = [...fpsByRepo].map(([_repo, records]) => {
        return `line [${records.map((r) => r.fps.toFixed(2)).join(', ')}]`;
    });
    const xAxis = dailyStats.map((d) => `${monthNames[d.date.getUTCMonth()]}-${d.date.getUTCDate()}`);
    return inject`
        ## Daily Performance

        ${'```mermaid'}
        xychart-beta
            title Files Per Second by Day
            y-axis Files per Second
            x-axis Date [${xAxis.join(', ')}]
            bar [${bar.join(', ')}]
            ${lines.join('\n')}
        ${'```'}
    `;
}

function createDailyStats(data: CsvRecord[]): DailyStats[] {
    const dailyStats: DailyStats[] = [];

    const repoNames = [...new Set(data.map((r) => r.repo))];

    const recordsByDay = groupBy(data, (r) => new Date(r.timestamp).setUTCHours(0, 0, 0, 0));

    const entries = [...recordsByDay.entries()].sort((a, b) => a[0] - b[0]);

    for (const [dayTs, records] of entries) {
        const date = new Date(dayTs);
        const files = records.reduce((sum, r) => sum + r.files, 0);
        const elapsedSeconds = records.reduce((sum, r) => sum + r.elapsedMs, 0) / 1000;
        const fps = files / elapsedSeconds;
        const aFps = records.map((r) => (1000 * r.files) / r.elapsedMs).sort((a, b) => a - b);
        const fpsMax = Math.max(...aFps);
        const fpsMin = Math.min(...aFps);

        const fpsP90 = calcP(aFps, 0.9);
        const fpsP10 = calcP(aFps, 0.1);

        const fpsByRepo = new Map(
            [...groupBy(records, 'repo')].map(
                ([repo, records]) =>
                    [
                        repo,
                        records.reduce((sum, r) => sum + (1000 * r.files) / r.elapsedMs, 0) / records.length,
                    ] as const,
            ),
        );
        repoNames.forEach((repo) => {
            fpsByRepo.set(repo, fpsByRepo.get(repo) || 0);
        });

        dailyStats.push({ date, files, elapsedSeconds, fps, fpsMax, fpsMin, fpsP90, fpsP10, fpsByRepo });
    }
    return dailyStats;
}

function sub(text: string) {
    return `<sub>${text}</sub>`;
}

function calcP(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length * p;
    const i = Math.floor(n);
    const d = n - i;
    return sorted[i] * (1 - d) + sorted[i + 1] * d;
}
