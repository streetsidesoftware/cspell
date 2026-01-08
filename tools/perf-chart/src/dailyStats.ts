import { type CalcStats, calcStats, getEmptyStats, sumRecords } from './calcAllStats.ts';
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
}

export function createDailyStats(data: CsvRecordsRO): DailyStats[] {
    const dailyStats: DailyStats[] = [];

    const repoNames = [...new Set(data.map((r) => r.repo))];

    const recordsByDay = groupBy(data, (r) => new Date(r.timestamp).setUTCHours(0, 0, 0, 0));

    const entries = [...recordsByDay.entries()].sort((a, b) => a[0] - b[0]);

    for (const [dayTs, records] of entries) {
        const date = new Date(dayTs);
        const files = sumRecords(records, (r) => r.files);
        const elapsedSeconds = sumRecords(records, (r) => r.elapsedMs) / 1000;
        const fps = files / elapsedSeconds; // calcStats(records, (r) => (1000 * r.files) / r.elapsedMs);
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

        dailyStats.push({ date, files, elapsedSeconds, fps, fpsByRepo, kps, kpsStats });
    }
    return dailyStats;
}
