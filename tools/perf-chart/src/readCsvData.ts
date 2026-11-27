import { promises as fs } from 'node:fs';

import { parse as parseCsv } from 'csv-parse/sync';

import type { CsvRecord } from './CsvRecord.ts';

export async function readCsvData(csvFile: string | URL): Promise<CsvRecord[]> {
    return parseCsvData(await fs.readFile(csvFile, 'utf8'));
}

export function parseCsvData(csv: string): CsvRecord[] {
    // New columns are added at the end, so older rows are shorter than the header.
    return parseCsv(csv, { columns: true, cast: true, relax_column_count_less: true }) as CsvRecord[];
}
