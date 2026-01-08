import { plotPointRelativeToStandardDeviation, simpleHistogram } from 'thistogram';

import { calcAllStats } from './calcAllStats.ts';
import type { CsvRecord, CsvRecordsRO } from './CsvRecord.ts';
import type { DailyStats } from './dailyStats.ts';
import { createDailyStats } from './dailyStats.ts';
import { groupBy } from './groupBy.ts';
import type { Options } from './options.ts';
import { createMdTable, inject } from './text.ts';

export function perfReportMd(records: CsvRecordsRO, _options: Options): string {
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
        <details>
        <summary>Time to Process Files</summary>

        ${table}

        Note:
        - Elapsed time is in seconds.
        </details>
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
        <details>
        <summary>Files per Second over Time</summary>

        ${table}
        </details>
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
        <details>
        <summary>Data Throughput</summary>

        ${table}
        </details>
    `;
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
        return `line [${records.map((r) => r.fps.avg.toFixed(2)).join(', ')}]`;
    });
    const xAxis = dailyStats.map((d) => `${monthNames[d.date.getUTCMonth()]}-${d.date.getUTCDate()}`);
    return inject`
        <details>
        <summary>Daily Performance</summary>

        ${'```mermaid'}
        xychart-beta
            title Files Per Second by Day
            y-axis Files per Second
            x-axis Date [${xAxis.join(', ')}]
            bar [${bar.join(', ')}]
            ${lines.join('\n')}
        ${'```'}
        </details>
    `;
}

function sub(text: string) {
    return `<sub>${text}</sub>`;
}
