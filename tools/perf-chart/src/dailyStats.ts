import { stringify as csvStringify } from 'csv-stringify/sync';

import type { CalcStats, SumMinMaxMidAvg } from './calcAllStats.ts';
import { calcStats, calcSumMinMaxMidAvg, getEmptyStats, sumRecords } from './calcAllStats.ts';
import type { CsvRecordsRO } from './CsvRecord.ts';
import { groupBy } from './groupBy.ts';

export interface DailyStats {
    date: Date;
    files: number;
    elapsedSeconds: number;
    fps: number;
    kps: number;
    kpsStats: CalcStats;
    fpsByRepo: Map<string, CalcStats>;
    count: number;
    fpsS: SumMinMaxMidAvg;
    kpsS: SumMinMaxMidAvg;
    runs: number;
}

export function createDailyStats(data: CsvRecordsRO): DailyStats[] {
    const dailyStats: DailyStats[] = [];

    const repoNames = [...new Set(data.map((r) => r.repo))];

    const recordsByDay = groupBy(data, (r) => new Date(r.timestamp).setUTCHours(0, 0, 0, 0));

    const entries = [...recordsByDay.entries()].sort((a, b) => a[0] - b[0]);

    for (const [dayTs, records] of entries) {
        const byRun = groupBy(records, 'runId');
        const date = new Date(dayTs);
        const filesTotal = sumRecords(records, (r) => r.files);
        const elapsedSeconds = sumRecords(records, (r) => r.elapsedMs) / 1000;
        const fps = filesTotal / elapsedSeconds;

        // cspell:ignore SMMMA
        const fpsS = calcSumMinMaxMidAvg(records, (r) => (1000 * r.files) / r.elapsedMs);
        const kpsS = calcSumMinMaxMidAvg(records, (r) => (1000 * (r.kilobytes || 0)) / r.elapsedMs);

        const kps = sumRecords(records, (r) => r.kilobytes || 0) / elapsedSeconds;
        const kpsStats = calcStats(records, (r) => r.kilobytes || 0);

        const fpsByRepo = new Map(
            [...groupBy(records, 'repo')].map(
                ([repo, records]) => [repo, calcStats(records, (r) => (1000 * r.files) / r.elapsedMs)] as const,
            ),
        );
        repoNames.forEach((repo) => {
            fpsByRepo.set(repo, fpsByRepo.get(repo) || getEmptyStats());
        });

        dailyStats.push({
            date,
            files: filesTotal,
            elapsedSeconds,
            fps,
            fpsByRepo,
            kps,
            kpsStats,
            count: records.length,
            fpsS,
            kpsS,
            runs: byRun.size,
        });
    }
    return dailyStats;
}

export function dailyStatsToCsv(dailyStats: DailyStats[]): string {
    const data = dailyStats.map((ds) => ({
        date: ds.date.toISOString().split('T')[0],
        files: ds.files,
        elapsed_seconds: ds.elapsedSeconds.toFixed(2),
        files_per_run: ds.files / ds.runs,
        elapsed_seconds_per_run: (ds.elapsedSeconds / ds.runs).toFixed(2),
        fps: ds.fps.toFixed(2),
        fps_avg: ds.fpsS.avg.toFixed(2),
        fps_min: ds.fpsS.min.toFixed(2),
        fps_mid: ds.fpsS.mid.toFixed(2),
        fps_max: ds.fpsS.max.toFixed(2),
        kps: ds.kps.toFixed(2),
        kps_avg: ds.kpsS.avg.toFixed(2),
        kps_min: ds.kpsS.min.toFixed(2),
        kps_mid: ds.kpsS.mid.toFixed(2),
        kps_max: ds.kpsS.max.toFixed(2),
        count: ds.count,
        runs: ds.runs,
    }));
    return formatCsv(csvStringify(data, { header: true }));
}

function formatCsv(table: string): string {
    const lines = table.split('\n').filter((a) => !!a.trim());
    const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()));
    const colWidths: number[] = [];
    for (const row of rows) {
        row.forEach((cell, i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, cell.length);
        });
    }
    const isNumber = /^\d+(\.\d+)?$/;
    const rowsAligned = rows.map((row) =>
        row.map((v, i) => (isNumber.test(v) ? v.padStart(colWidths[i], ' ') : v.padEnd(colWidths[i], ' '))),
    );
    return rowsAligned.map((row) => row.join(', ')).join('\n') + '\n';
}
