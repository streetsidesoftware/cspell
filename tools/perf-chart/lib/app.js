import { program } from 'commander';
import { promises } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { calcStandardDeviation, plotPointRelativeToStandardDeviation, simpleHistogram } from 'thistogram';

//#region src/text.ts
/**
 * Inject values into a template string.
 * @param {TemplateStringsArray} template
 * @param  {...any} values
 * @returns
 */
function inject(template, ...values) {
    return unindent(template, ...values);
}
/**
 * Inject values into a template string.
 * @param {TemplateStringsArray} template
 * @param  {...any} values
 * @returns
 */
function _inject(template, ...values) {
    const strings = template;
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad$1 = '';
        const valueLines = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad$1 + line);
            pad$1 = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }
    return _unindent(String.raw({ raw: strings }, ...adjValues));
}
/**
 *
 * @param options - table options
 * @returns
 */
function createMdTable(options) {
    const rows = options.rows.map((row) => row.map((col) => `${col}`.trim()));
    let header;
    let headerSep;
    if (typeof options.header === 'string') {
        const hLines = options.header
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => !!line)
            .map((line) =>
                line
                    .replace(/^\s*\|/, '')
                    .replace(/\|\s*$/, '')
                    .split('|')
                    .map((col) => col.trim()),
            );
        header = hLines[0];
        headerSep = options.headerSep || hLines[1];
    } else {
        header = options.header.map((col) => `${col}`.trim());
        headerSep = options.headerSep || [];
    }
    const justifyLeft = (s$1, width) => padRight(s$1.trim(), width);
    const justifyRight = (s$1, width) => padLeft(s$1.trim(), width);
    function calcColHeaderSep(sep, width) {
        const pL = sep.startsWith(':') ? ':' : '';
        const pR = sep.endsWith(':') ? ':' : '';
        width -= pL.length + pR.length;
        return `${pL}${'---'.padEnd(width, '-')}${pR}`;
    }
    const justifyCols = [];
    const hSep = [...headerSep];
    hSep.length = header.length;
    header.forEach((col, i) => {
        const s$1 = hSep[i] || '---';
        const h = calcColHeaderSep(s$1, strWidth(col));
        const jL = h.startsWith(':');
        const jR = h.endsWith(':');
        justifyCols[i] = jL ? justifyLeft : jR ? justifyRight : justifyLeft;
        hSep[i] = h;
    });
    const table = [[...header], hSep, ...rows.map((row) => [...row])];
    const widths = [];
    table.forEach((row) => row.forEach((col, i) => (widths[i] = Math.max(widths[i] || 0, strWidth(col)))));
    table[1] = table[1].map((col, i) => calcColHeaderSep(col, widths[i]));
    return table
        .map((row) => row.map((col, i) => justifyCols[i](col, widths[i])).join(' | '))
        .map((row) => `| ${row} |`)
        .join('\n');
}
/**
 * Calculate the padding at the start of the string.
 * @param {string} s
 * @returns {number}
 */
function padLength(s$1) {
    return s$1.length - s$1.trimStart().length;
}
function unindent(template, ...values) {
    if (typeof template === 'string') return _unindent(template);
    return _inject(template, ...values);
}
/**
 * Remove the left padding from a multi-line string.
 * @param {string} str
 * @returns {string}
 */
function _unindent(str) {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }
    return lines.map((line) => line.slice(curPad)).join('\n');
}
function padLeft(s$1, width) {
    return s$1.padStart(width + (s$1.length - strWidth(s$1)));
}
function padRight(s$1, width) {
    return s$1.padEnd(width + (s$1.length - strWidth(s$1)));
}
function strWidth(str) {
    return [...str].length;
}

//#endregion
//#region src/perfChart.ts
async function perfReport(csvFile) {
    const limit = changeDate(/* @__PURE__ */ new Date(), -30).getTime();
    console.error(`Generating performance report from ${csvFile} since ${new Date(limit).toISOString()}`);
    const recordsInRange = (await readCsvData(csvFile)).filter((r) => r.platform === 'linux' && r.timestamp >= limit);
    const runsInRange = groupCsvRecordsByRun(recordsInRange);
    const runs = filterOutIncompleteRuns(runsInRange);
    const records = runs.flat();
    console.error(`Runs: ${runs.length}, Records: ${records.length}`);
    reportOnCsvRecords(records);
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
function countCsvRecordsByRepo(records, counts = /* @__PURE__ */ new Map()) {
    for (const r of records) {
        const count = (counts.get(r.repo) || 0) + 1;
        counts.set(r.repo, count);
    }
    return counts;
}
function filterOutIncompleteRuns(runs) {
    if (runs.length === 0) return runs;
    const sizes = runs.map((r) => r.length);
    const maxSize = Math.max(...sizes);
    if (sizes.length * maxSize === sizes.reduce((a, b) => a + b, 0)) return runs;
    const maxDelta = 2;
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
    function getSize(i) {
        if (i < 0) return sizes[0];
        if (i >= sizes.length) return sizes[sizes.length - 1];
        return sizes[i];
    }
}
function groupCsvRecordsByRun(records) {
    const gapPadding = 60 * 1e3;
    const runs = [];
    const seen = /* @__PURE__ */ new Set();
    let run = [];
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
function reportOnCsvRecords(records) {
    const repos = [...new Set(records.map((r) => r.repo))].sort();
    const runs = groupCsvRecordsByRun(records);
    runs.forEach((run, i) => {
        const runStartTime = Math.min(...run.map((r) => r.timestamp));
        const runEndTime = Math.max(...run.map((r) => r.timestamp));
        const runId = (i + 1).toFixed(0).padStart(2, '0');
        const runRepoNames = new Set(run.map((r) => r.repo));
        const groupedByRepo = new Map(repos.map((repo) => [repo, 0]));
        const unexpectedResults = [...countCsvRecordsByRepo(run, groupedByRepo)].filter(([_, count]) => count != 1);
        console.error(
            `Run ${runId} ${new Date(runStartTime).toISOString()} repos: ${pad(runRepoNames.size, 2)} ${deltaTimeMsInDHMS(runEndTime - runStartTime)} `,
        );
        for (const [repo, count] of unexpectedResults) console.error(`  ${repo.padEnd(20)}: ${count} records`);
    });
}
function deltaTimeMsInDHMS(deltaMs) {
    return deltaTimeSInDHMS(deltaMs / 1e3);
}
function pad(s$1, n) {
    const t = typeof s$1 === 'number' ? s$1.toString() : s$1;
    return n < 0 ? t.padEnd(-n, ' ') : t.padStart(n, ' ');
}
function deltaTimeSInDHMS(deltaSec) {
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
async function readCsvData(csvFile) {
    const csv = await promises.readFile(csvFile, 'utf8');
    const records = parse(csv, {
        columns: true,
        cast: true,
    });
    return records;
}
const emptyStats = {
    point: 0,
    avg: 0,
    min: 0,
    max: 0,
    sum: 0,
    count: 0,
    sd: 0,
    trend: [0],
};
/**
 * Extract data and calculate min, max, and median
 * The min/max/median values do NOT include the point value.
 * @param data - the perf data.
 * @returns [point, min, max]
 */
function calcStats(data, fn = (d) => d.elapsedMs) {
    const values = data.map((d) => fn(d)).map((v) => v || 1);
    const trend = values.slice(-20);
    const point = values.pop();
    if (point === void 0) return emptyStats;
    if (values.length === 0)
        return {
            point,
            avg: point,
            min: point,
            max: point,
            sum: point,
            count: 1,
            sd: 0,
            trend,
        };
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / (values.length || 1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sd = calcStandardDeviation(values);
    return {
        point,
        avg,
        min,
        max,
        sum,
        count: values.length,
        sd,
        trend,
    };
}
function groupBy(data, key) {
    const fn = typeof key === 'function' ? key : (d) => d[key];
    const map = /* @__PURE__ */ new Map();
    for (const d of data) {
        const k = fn(d);
        const group = map.get(k) || [];
        group.push(d);
        map.set(k, group);
    }
    return map;
}
function changeDate(date, deltaDays) {
    const d = new Date(date);
    const n = d.setUTCHours(0, 0, 0, 0);
    const dd = new Date(n + deltaDays * 24 * 60 * 60 * 1e3);
    dd.setUTCHours(0, 0, 0, 0);
    return dd;
}
function calcAllStats(data, fn) {
    return data.map(([_, records]) => calcStats(records, fn));
}
function p(s$1, n) {
    return n < 0 ? s$1.padEnd(-n, ' ') : s$1.padStart(n, ' ');
}
/**
 * Convert a value in milliseconds to seconds and format it.
 * @param v
 * @param fixed
 */
const s = (v, fixed = 3) => (v / 1e3).toFixed(fixed);
function createPerfTable1(data) {
    const sp = (v, pad$1 = 5, fixed = 1) => p(s(v, fixed), pad$1);
    const stats = calcAllStats(data);
    const maxRelSd = Math.max(...stats.map((s$1) => (s$1.sd * s$1.sum) / s$1.count));
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
function createFpsPerfTable(data) {
    const fn = (d) => (1e3 * d.files) / d.elapsedMs;
    const stats = calcAllStats(data, fn);
    const rows = data.map(([repo, records], i) => {
        const { point, count, trend, min, avg } = stats[i];
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
function createThroughputPerfTable(data) {
    data = data.map(([repo, records]) => [repo, records.filter((r) => r.kilobytes)]);
    const fn = (d) => (1e3 * (d.kilobytes || 0)) / d.elapsedMs;
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
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function createDailyPerfGraph(dailyStats) {
    const bar = dailyStats.map((d) => d.fps.toFixed(2));
    const fpsByRepo = groupBy(
        dailyStats.flatMap((d) =>
            [...d.fpsByRepo].map(([repo, fps]) => ({
                repo,
                fps,
            })),
        ),
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
function createDailyStats(data) {
    const dailyStats = [];
    const repoNames = [...new Set(data.map((r) => r.repo))];
    const recordsByDay = groupBy(data, (r) => new Date(r.timestamp).setUTCHours(0, 0, 0, 0));
    const entries = [...recordsByDay.entries()].sort((a, b) => a[0] - b[0]);
    for (const [dayTs, records] of entries) {
        const date = new Date(dayTs);
        const files = records.reduce((sum, r) => sum + r.files, 0);
        const elapsedSeconds = records.reduce((sum, r) => sum + r.elapsedMs, 0) / 1e3;
        const fps = files / elapsedSeconds;
        const aFps = records.map((r) => (1e3 * r.files) / r.elapsedMs).sort((a, b) => a - b);
        const fpsMax = Math.max(...aFps);
        const fpsMin = Math.min(...aFps);
        const fpsP90 = calcP(aFps, 0.9);
        const fpsP10 = calcP(aFps, 0.1);
        const fpsByRepo = new Map(
            [...groupBy(records, 'repo')].map(([repo, records$1]) => [
                repo,
                records$1.reduce((sum, r) => sum + (1e3 * r.files) / r.elapsedMs, 0) / records$1.length,
            ]),
        );
        repoNames.forEach((repo) => {
            fpsByRepo.set(repo, fpsByRepo.get(repo) || 0);
        });
        dailyStats.push({
            date,
            files,
            elapsedSeconds,
            fps,
            fpsMax,
            fpsMin,
            fpsP90,
            fpsP10,
            fpsByRepo,
        });
    }
    return dailyStats;
}
function sub(text) {
    return `<sub>${text}</sub>`;
}
function calcP(values, p$1) {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length * p$1;
    const i = Math.floor(n);
    const d = n - i;
    return sorted[i] * (1 - d) + sorted[i + 1] * d;
}

//#endregion
//#region src/app.ts
program
    .argument('<file>', 'path to perf data file')
    .description('Generate a min/max chart of the perf data')
    .action(async (file) => {
        const chart = await perfReport(file);
        console.log(chart);
    })
    .parseAsync();

//#endregion
