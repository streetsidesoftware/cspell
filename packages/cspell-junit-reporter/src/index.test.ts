import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('fs', () => ({
    promises: {
        writeFile: async () => undefined,
        mkdir: async () => undefined,
    },
}));

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { CSpellReporter } from '@cspell/cspell-types';

import { getReporter } from './index.js';

describe('getReporter', () => {
    let mockWriteFile = vi.spyOn(fs, 'writeFile');

    beforeEach(() => {
        vi.resetAllMocks();
        mockWriteFile = vi.spyOn(fs, 'writeFile');
    });

    afterEach(() => {
        vi.resetAllMocks();
        mockWriteFile.mockReset();
    });

    test('throws for invalid config', () => {
        expect(() => getReporter({ outFile: {} })).toThrowErrorMatchingSnapshot();
    });

    test('saves xml to file', async () => {
        const reporter = getReporter({ outFile: 'out.xml' });
        await runReporter(reporter);
        expect(mockWriteFile).toHaveBeenCalledTimes(1);

        expect(mockWriteFile.mock.calls[0][0]).toEqual(path.join(process.cwd(), 'out.xml'));
        expect(mockWriteFile.mock.calls[0][1]).toMatchSnapshot();
    });

    test.each`
        settings
        ${undefined}
        ${{ outFile: undefined }}
        ${{ outFile: 'stdout' }}
        ${{ outFile: 'stderr' }}
    `('saves xml to stdout/stderr $settings', async ({ settings }) => {
        const stdout = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const stderr = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const reporter = getReporter(settings);
        await runReporter(reporter);
        expect(joinCalls(stderr.mock.calls)).toMatchSnapshot();
        expect(joinCalls(stdout.mock.calls)).toMatchSnapshot();
    });

    test.each`
        settings
        ${undefined}
        ${{ outFile: undefined }}
        ${{ outFile: 'stdout' }}
        ${{ outFile: 'stderr' }}
    `('saves xml to console $settings', async ({ settings }) => {
        const console = {
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
        };

        const reporter = getReporter(settings, { console });
        await runReporter(reporter);
        expect(joinCalls(console.error.mock.calls)).toMatchSnapshot();
        expect(joinCalls(console.log.mock.calls)).toMatchSnapshot();
    });

    test('uses a custom suite name', async () => {
        const reporter = getReporter({ outFile: 'out.xml', suiteName: 'my-project' });
        await runReporter(reporter);
        expect(mockWriteFile.mock.calls[0][1]).toContain('<testsuites name="my-project"');
    });

    test('groups a clean file and a file with errors into separate testsuites', async () => {
        const reporter = getReporter({ outFile: 'out.xml' });
        reporter.progress({
            type: 'ProgressFileComplete',
            fileNum: 1,
            fileCount: 2,
            filename: 'clean.txt',
            elapsedTimeMs: 1,
            processed: true,
            numErrors: 0,
        });
        reporter.progress({
            type: 'ProgressFileComplete',
            fileNum: 2,
            fileCount: 2,
            filename: 'dirty.txt',
            elapsedTimeMs: 1,
            processed: true,
            numErrors: 1,
        });
        // cSpell:disable
        reporter.issue({
            text: 'errrorrrs',
            offset: 0,
            line: { text: 'errrorrrs', offset: 0 },
            row: 1,
            col: 1,
            uri: 'dirty.txt',
        });
        // cSpell:enable
        await reporter.result({ files: 2, filesWithIssues: new Set(['dirty.txt']), issues: 1, errors: 0 });

        const xml = mockWriteFile.mock.calls[0][1] as string;
        expect(xml).toContain('<testsuite name="clean.txt" tests="1" failures="0"');
        expect(xml).toContain('<testsuite name="dirty.txt" tests="1" failures="1"');
    });

    test('reports processing errors in a dedicated testsuite', async () => {
        const reporter = getReporter({ outFile: 'out.xml' });
        reporter.error('could not read config', new Error('ENOENT'));
        await reporter.result({ files: 0, filesWithIssues: new Set(), issues: 0, errors: 1 });

        const xml = mockWriteFile.mock.calls[0][1] as string;
        expect(xml).toContain('<testsuite name="cspell-errors"');
        expect(xml).toContain('<error type="error" message="ENOENT">ENOENT</error>');
    });
});

function joinCalls(calls: unknown[][]): string {
    return calls.map((call) => call.join('<>')).join('\n');
}

async function runReporter(reporter: Required<CSpellReporter>): Promise<void> {
    reporter.debug('foo');
    reporter.error('something went wrong', new Error('oh geez'));
    reporter.info('some logs', 'Info');

    // cSpell:disable
    reporter.issue({
        text: 'fulll',
        offset: 13,
        line: { text: 'This text is fulll of errrorrrs.', offset: 0 },
        row: 1,
        col: 14,
        uri: 'text.txt',
    });
    // cSpell:enable

    reporter.progress({
        type: 'ProgressFileComplete',
        fileNum: 1,
        fileCount: 1,
        filename: 'text.txt',
        elapsedTimeMs: 349.058747,
        processed: true,
        numErrors: 1,
    });

    await reporter.result({
        files: 1,
        filesWithIssues: new Set(['text.txt']),
        issues: 1,
        errors: 1,
        cachedFiles: 0,
    });
}
