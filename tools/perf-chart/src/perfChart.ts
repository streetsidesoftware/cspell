import { promises as fs } from 'node:fs';

import { parse as parseCsv } from 'csv-parse/sync';
import { histogram } from 'thistogram';

interface CsvRecord {
    timestamp: string;
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
    const csv = await fs.readFile(csvFile, 'utf-8');
    const records = parseCsv(csv, { columns: true }) as CsvRecord[];
    const data = groupBy(
        records.filter((r) => r.platform === 'linux'),
        'repo',
    );
    const chartData = [...data.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([repo, records]) => [repo, ...extractPointMinMax(records)] as [string, number, number, number]);
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

function extractPointMinMax(data: CsvRecord[]): [point: number, min: number, max: number] {
    const values = data
        .map((d) => d.elapsedMs)
        .map((v) => v - 0)
        .slice(-50);
    const point = values.pop();
    if (point === undefined) return [1, 1, 1];
    values.sort((a, b) => a - b);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p = (values.length - 1) / 2;
    const mean = (values[Math.floor(p)] + values[Math.ceil(p)]) / 2;
    max === mean && console.log('max === mean, %o', { point, min, max, mean, values });
    return [point / mean, min / mean, max / mean].map((v) => Math.round(v * 1000) / 1000) as [number, number, number];
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
