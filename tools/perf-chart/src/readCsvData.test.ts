import { parse as parseCsv } from 'csv-parse/sync';
import { describe, expect, test } from 'vitest';

import { parseCsvData, readCsvData } from './readCsvData.ts';

const oldHeader =
    'timestamp,repo,elapsedMs,files,filesWithIssues,issues,errors,platform,usageUser,usageSystem,kilobytes';
const header = oldHeader + ',cpuModel,cpuCores';

const base = '1795204170498,Azure/azure-rest-api-specs,12146.92,2626,10,307,0,linux,14367.373,1140.48,8462';
const newRow = base + ',"Model, A",4';
const unknownCpuRow = base + ',,4';

const oldRecord = {
    timestamp: 1_795_204_170_498,
    repo: 'Azure/azure-rest-api-specs',
    elapsedMs: 12_146.92,
    files: 2626,
    filesWithIssues: 10,
    issues: 307,
    errors: 0,
    platform: 'linux',
    usageUser: 14_367.373,
    usageSystem: 1140.48,
    kilobytes: 8462,
};
const newRecord = { ...oldRecord, cpuModel: 'Model, A', cpuCores: 4 };
const unknownCpuRecord = { ...oldRecord, cpuModel: '', cpuCores: 4 };

describe('readCsvData', () => {
    test.each`
        comment                   | lines                              | expected
        ${'old rows, old header'} | ${[oldHeader, base]}               | ${[oldRecord]}
        ${'old rows, new header'} | ${[header, base]}                  | ${[oldRecord]}
        ${'new rows'}             | ${[header, newRow, unknownCpuRow]} | ${[newRecord, unknownCpuRecord]}
        ${'a mix of rows'}        | ${[header, base, newRow, base]}    | ${[oldRecord, newRecord, oldRecord]}
    `('parseCsvData $comment', ({ lines, expected }) => {
        expect(parseCsvData(lines.join('\n') + '\n')).toEqual(expected);
    });

    test('rows longer than the header are an error', () => {
        expect(() => parseCsvData([oldHeader, newRow].join('\n'))).toThrow('Invalid Record Length');
    });

    test('perf.csv', async () => {
        const url = new URL('../../../integration-tests/perf/perf.csv', import.meta.url);
        const records = await readCsvData(url);
        expect(records.length).toBeGreaterThan(59_000);
        expect(records.filter((r) => typeof r.timestamp !== 'number')).toEqual([]);
    });

    test('Validate csv-parse assumptions', () => {
        const csv = 'a,b,c\n1,2\n';
        expect(() => parseCsv(csv, { columns: true })).toThrow('Invalid Record Length');
        expect(parseCsv(csv, { columns: true, relax_column_count_less: true })).toEqual([{ a: '1', b: '2' }]);
    });
});
