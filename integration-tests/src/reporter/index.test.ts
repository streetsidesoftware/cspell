import { readFileSync } from 'node:fs';
import os from 'node:os';

import { parse as parseCsv } from 'csv-parse/sync';
import { describe, expect, test } from 'vitest';

import { __testing__ } from './index.js';

const { csvHeaders, getCpuModel, stringifyCsvRecord } = __testing__;

const record = {
    timestamp: '1795204170498',
    repo: 'googleapis/google-cloud-cpp',
    elapsedMs: 94_402.494,
    files: 22_252,
    filesWithIssues: 8430,
    issues: 50_856,
    errors: 0,
    platform: 'linux',
    usageUser: 101_506.307,
    usageSystem: 1698.118,
    kilobytes: 197_127,
    cpuModel: '',
    cpuCores: 4,
};

const rowPrefix =
    '1795204170498,googleapis/google-cloud-cpp,94402.49,22252,8430,50856,0,linux,101506.307,1698.118,197127';

describe('perf csv', () => {
    test('the headers match perf.csv', () => {
        const csv = readFileSync(new URL('../../perf/perf.csv', import.meta.url), 'utf8');
        expect(csv.slice(0, csv.indexOf('\n'))).toBe(csvHeaders.join(','));
    });

    test.each`
        model                                        | expected
        ${'AMD EPYC 7763 64-Core Processor'}         | ${'AMD EPYC 7763 64-Core Processor'}
        ${'  Intel(R)  Xeon(R)\tCPU @ 2.80GHz\r\n '} | ${'Intel(R) Xeon(R) CPU @ 2.80GHz'}
        ${''}                                        | ${''}
    `('getCpuModel $model', ({ model, expected }) => {
        expect(getCpuModel([{ model }, { model: 'other' }])).toBe(expected);
    });

    test('getCpuModel without CPUs', () => {
        expect(getCpuModel([])).toBe('');
    });

    test.each`
        cpuModel                             | expected
        ${'AMD EPYC 7763 64-Core Processor'} | ${'AMD EPYC 7763 64-Core Processor'}
        ${'Model, with "quotes"'}            | ${'"Model, with ""quotes"""'}
        ${''}                                | ${''}
    `('stringifyCsvRecord $cpuModel', ({ cpuModel, expected }) => {
        const row = stringifyCsvRecord({ ...record, cpuModel });
        expect(row).toBe(`${rowPrefix},${expected},4\n`);
        expect(parseRow(row)).toMatchObject({ kilobytes: '197127', cpuModel, cpuCores: '4' });
    });

    test('stringifyCsvRecord for this machine', () => {
        const cpuModel = getCpuModel(os.cpus());
        const cpuCores = os.availableParallelism();
        const row = stringifyCsvRecord({ ...record, cpuModel, cpuCores });
        expect(row.split('\n')).toEqual([expect.stringContaining(rowPrefix), '']);
        expect(parseRow(row)).toMatchObject({ cpuModel, cpuCores: String(cpuCores) });
    });
});

function parseRow(row: string): unknown {
    return parseCsv(row, { columns: [...csvHeaders] })[0];
}
