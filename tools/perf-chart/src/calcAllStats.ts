import { calcStandardDeviation } from 'thistogram';

import type { CsvRecord } from './CsvRecord.ts';

export interface CalcStats {
    avg: number;
    min: number;
    max: number;
    sum: number;
    count: number;
    sd: number;
    p90: number;
    p10: number;
    trend: number[];
}

export interface CalcStatsPoint extends CalcStats {
    point: number;
}

const emptyStats: CalcStatsPoint = {
    point: 0,
    avg: 0,
    min: 0,
    max: 0,
    sum: 0,
    count: 0,
    sd: 0,
    trend: [0],
    p90: 0,
    p10: 0,
};

export function getEmptyStats(point: number = 0): CalcStatsPoint {
    return {
        ...emptyStats,
        point,
        avg: point,
        min: point,
        max: point,
        sum: point,
        count: 1,
        sd: 0,
        trend: [0],
        p90: point,
        p10: point,
    };
}

/**
 * Extract data and calculate min, max, and median
 * The min/max/median values do NOT include the point value.
 * @param data - the perf data.
 * @returns [point, min, max]
 */
function calcStatsPoint(data: CsvRecord[], fn: (d: CsvRecord) => number = (d) => d.elapsedMs): CalcStatsPoint {
    const values = data.map((d) => fn(d)).map((v) => v || 1);
    const trend = values.slice(-20);
    const point = values.pop();
    values.sort((a, b) => a - b);
    if (point === undefined) return getEmptyStats();
    if (values.length === 0) return getEmptyStats(point);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / (values.length || 1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sd = calcStandardDeviation(values);

    const p90 = calcP(values, 0.9);
    const p10 = calcP(values, 0.1);

    return { point, avg, min, max, sum, count: values.length, sd, trend, p90, p10 };
}

/**
 * Extract data and calculate min, max, and median
 * The min/max/median values do include the point value.
 * @param data - the perf data.
 * @returns [point, min, max]
 */
export function calcStats(data: CsvRecord[], fn: (d: CsvRecord) => number): CalcStats {
    const values = data.map((d) => fn(d)).map((v) => v || 1);
    const trend = values.slice(-20);
    values.sort((a, b) => a - b);
    if (values.length === 0) return getEmptyStats();
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / (values.length || 1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sd = calcStandardDeviation(values);
    const p90 = calcP(values, 0.9);
    const p10 = calcP(values, 0.1);
    return { avg, min, max, sum, count: values.length, sd, trend, p90, p10 };
}

export function calcAllStats(data: [string, CsvRecord[]][], fn?: (d: CsvRecord) => number): CalcStatsPoint[] {
    return data.map(([_, records]) => calcStatsPoint(records, fn));
}

export function sumRecords(data: CsvRecord[], fn: (d: CsvRecord) => number): number {
    return data.reduce((sum, d) => sum + fn(d), 0);
}

function calcP(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length * p;
    const i = Math.floor(n);
    const d = n - i;
    return sorted[i] * (1 - d) + sorted[i + 1] * d;
}
