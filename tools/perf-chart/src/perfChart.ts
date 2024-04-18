import { promises as fs } from 'node:fs';

import { parse as parseCsv } from 'csv-parse/sync';
import { calcStandardDeviation, plotPointRelativeToStandardDeviation, simpleHistogram } from 'thistogram';

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
}

export async function perfReport(csvFile: string | URL): Promise<string> {
    const limit = changeDate(new Date(), -30).getTime();
    const records = (await readCsvData(csvFile)).filter((r) => r.platform === 'linux' && r.timestamp >= limit);
    const data = [...groupBy(records, 'repo')].sort((a, b) => a[0].localeCompare(b[0]));
    const markdown = `\
# Performance Report

${createPerfTable1(data)}

${createPerfTable2(data)}

`;
    return markdown;
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
function calcStats(data: CsvRecord[]): CalcStats {
    const values = data.map((d) => d.elapsedMs).map((v) => v || 1);
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

function groupBy<T, K extends keyof T>(data: T[], key: K): Map<T[K], T[]> {
    const map = new Map<T[K], T[]>();
    for (const d of data) {
        const k = d[key];
        const group = map.get(k) || [];
        group.push(d);
        map.set(k, group);
    }
    return map;
}

function changeDate(date: Date, deltaDays: number): Date {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + deltaDays);
    return d;
}

function calcAllStats(data: [string, CsvRecord[]][]): CalcStats[] {
    return data.map(([_, records]) => calcStats(records));
}

function p(s: string, n: number): string {
    return n < 0 ? s.padEnd(-n, ' ') : s.padStart(n, ' ');
}

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
        return `| ${repo.padEnd(36)} | ${p(s(point, 2), 6)} | ${sp(min)} / ${sp(avg)} / ${sp(max)} | ${sp(sd, 5, 2)} | \`${sdGraph}\` |`;
    });

    return `
| Repository | Elapsed | Min/Avg/Max | SD  | SD Graph  |
| ---------- | ------: | ----------- | --: | --------  |
${rows.join('\n')}
`;
}

function createPerfTable2(data: [string, CsvRecord[]][]): string {
    const stats = calcAllStats(data);

    const rows = data.map(([repo], i) => {
        const { point, count, trend, sd, avg } = stats[i];
        const trendGraph = simpleHistogram(trend, avg - 2 * sd, avg + 3 * sd);
        const relChange = ((100 * (point - avg)) / (avg || 1)).toFixed(2) + '%';
        return `| ${repo.padEnd(36)} | ${p(s(point, 2), 6)} | ${p(relChange, 6)} | \`${trendGraph}\` | ${count} |`;
    });

    return `
| Repository | Elapsed | Rel   | Trend | Count |
| ---------- | ------: | ----: | ----- | ----: |
${rows.join('\n')}

Note:
- Elapsed time is in seconds. The trend graph shows the last 10 runs.
  The SD graph shows the current run relative to the average and standard deviation.
- Rel is the relative change from the average.
`;
}
