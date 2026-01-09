import type { CsvRecord, CsvRecordsRO } from './CsvRecord.ts';

export function filterOutIncompleteRuns(runs: CsvRecord[][]): CsvRecord[][] {
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

export function groupCsvRecordsByRun(records: CsvRecordsRO): CsvRecord[][] {
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
            run.push({ ...record, runId: runs.length });
            seen.add(record.repo);
        }
        lastTs = record.timestamp;
    }
    return runs;
}
