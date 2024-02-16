import { promises as fs } from 'node:fs';

import { parse as parseCsv } from 'csv-parse/sync';
import { histogram } from 'thistogram';

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

export async function perfChart(csvFile: string | URL): Promise<string> {
    const limit = changeDate(new Date(), -30).getTime();
    const records = (await readCsvData(csvFile)).filter((r) => r.platform === 'linux' && r.timestamp >= limit);
    const data = [...groupBy(records, 'repo')].sort((a, b) => a[0].localeCompare(b[0]));
    return createGraph(data);
}

export async function perfReport(csvFile: string | URL): Promise<string> {
    const limit = changeDate(new Date(), -30).getTime();
    const records = (await readCsvData(csvFile)).filter((r) => r.platform === 'linux' && r.timestamp >= limit);
    const data = [...groupBy(records, 'repo')].sort((a, b) => a[0].localeCompare(b[0]));
    const markdown = `\
# Performance Report

${createPerfTable(data)}

\`\`\`
${createGraph(data)}
\`\`\`


`;
    return markdown;
}

async function readCsvData(csvFile: string | URL): Promise<CsvRecord[]> {
    const csv = await fs.readFile(csvFile, 'utf-8');
    const records = parseCsv(csv, { columns: true, cast: true }) as CsvRecord[];
    return records;
}

function createGraph(data: [string, CsvRecord[]][]): string {
    const chartData = data.map(
        ([repo, records]) => [repo, ...extractPointMinMax(records)] as [string, number, number, number],
    );
    const allValues = chartData.flatMap(([_, value, min, max]) => [value, min, max]);
    const minOverallValue = Math.min(...allValues);
    const maxOverallValue = Math.max(...allValues);
    const maxDeviation = Math.max(maxOverallValue - 1, 1 - minOverallValue);
    const chart = histogram(chartData, {
        width: 100,
        maxLabelWidth: 30,
        title: 'Latest Performance by Repo',
        type: 'point-min-max',
        headers: ['Repo', 'Rel Val', 'Min', 'Max'],
        min: 1 - maxDeviation * 1.1,
        max: 1 + maxDeviation * 1.1,
        significantDigits: 3,
    });
    return chart;
}

/**
 * Extract data normalized to the median
 * @param data - the perf data.
 * @returns [point, min, max]
 */
function extractPointMinMax(data: CsvRecord[]): [point: number, min: number, max: number] {
    const { point, min, max, median } = calcStats(data);
    return [point / median, min / median, max / median].map((v) => Math.round(v * 1000) / 1000) as [
        number,
        number,
        number,
    ];
}

interface CalcStats {
    point: number;
    min: number;
    max: number;
    median: number;
    sum: number;
    count: number;
}

const emptyStats: CalcStats = { point: 0, min: 0, max: 0, median: 1, sum: 0, count: 0 };

/**
 * Extract data and calculate min, max, and median
 * The min/max/median values do NOT include the point value.
 * @param data - the perf data.
 * @returns [point, min, max]
 */
function calcStats(data: CsvRecord[]): CalcStats {
    const values = data.map((d) => d.elapsedMs).map((v) => v || 1);
    const point = values.pop();
    if (point === undefined) return emptyStats;
    if (values.length === 0) return { point, min: point, max: point, median: point, sum: point, count: 1 };
    values.sort((a, b) => a - b);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p = (values.length - 1) / 2;
    const median = (values[Math.floor(p)] + values[Math.ceil(p)]) / 2;
    return { point, min, max, median, sum: values.reduce((a, b) => a + b, 0), count: values.length };
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

function createPerfTable(data: [string, CsvRecord[]][]): string {
    const s = (v: number, fixed = 3) => (v / 1000).toFixed(fixed);

    const rows = data.map(([repo, records]) => {
        const { point, min, max, median, sum, count } = calcStats(records);
        const avg = sum / (count || 1);
        return `| ${repo} | ${s(point)} | ${((-100 * (point - median)) / (median || 1)).toFixed(2)}% | ${s(min)} | ${s(max)} | ${s(median)} | ${s(avg)} | ${count} |`;
    });
    return `
| Rep | Elapsed | Delta | Min | Max | Median | Avg | Count |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

Note: the stats do not include the last value.
`;
}
