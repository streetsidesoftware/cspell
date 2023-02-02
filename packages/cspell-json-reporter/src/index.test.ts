jest.mock('fs', () => ({
    promises: {
        writeFile: async () => undefined,
        mkdir: async () => undefined,
    },
}));

import type { CSpellReporter } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { promises as fs } from 'fs';
import * as path from 'path';

import { getReporter } from './index';

describe('getReporter', () => {
    let mockWriteFile = jest.spyOn(fs, 'writeFile');

    beforeEach(() => {
        jest.resetAllMocks();
        mockWriteFile = jest.spyOn(fs, 'writeFile');
    });

    afterEach(() => {
        jest.resetAllMocks();
        mockWriteFile.mockReset();
    });

    it('throws for invalid config', () => {
        expect(() => getReporter({ outFile: {} })).toThrowErrorMatchingSnapshot();
    });

    it('saves json to file', async () => {
        const reporter = getReporter({ outFile: 'out.json' });
        await runReporter(reporter);
        expect(mockWriteFile).toHaveBeenCalledTimes(1);

        expect(mockWriteFile.mock.calls[0][0]).toEqual(path.join(process.cwd(), 'out.json'));
        expect(mockWriteFile.mock.calls[0][1]).toMatchSnapshot();
    });

    it.each`
        settings
        ${undefined}
        ${{ outFile: undefined }}
        ${{ outFile: 'stdout' }}
        ${{ outFile: 'stderr' }}
    `('saves json to stdout/stderr $settings', async ({ settings }) => {
        const stdout = jest.spyOn(console, 'log'); // .mockImplementation(() => undefined);
        const stderr = jest.spyOn(console, 'error'); // .mockImplementation(() => undefined);
        const reporter = getReporter(settings);
        await runReporter(reporter);
        expect(joinCalls(stderr.mock.calls)).toMatchSnapshot();
        expect(joinCalls(stdout.mock.calls)).toMatchSnapshot();
    });

    it('saves additional data', async () => {
        const reporter = getReporter({ outFile: 'out.json', verbose: true, debug: true, progress: true });
        await runReporter(reporter);
        expect(fs.writeFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile.mock.calls[0][0]).toEqual(path.join(process.cwd(), 'out.json'));
        expect(mockWriteFile.mock.calls[0][1]).toMatchSnapshot();
    });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function joinCalls(calls: any[][]): string {
    return calls.map((call) => call.join('<>')).join('\n');
}

async function runReporter(reporter: Required<CSpellReporter>): Promise<void> {
    reporter.debug('foo');
    reporter.debug('bar');

    reporter.error('something went wrong', new Error('oh geez'));

    reporter.info('some logs', MessageTypes.Info);
    reporter.info('some warnings', MessageTypes.Warning);
    reporter.info('some debug logs', MessageTypes.Debug);

    // cSpell:disable
    reporter.issue({
        text: 'fulll',
        offset: 13,
        line: { text: 'This text is fulll of errrorrrs.', offset: 0 },
        row: 1,
        col: 14,
        uri: 'text.txt',
        context: { text: 'This text is fulll of errrorrrs.', offset: 0 },
    });
    // cSpell:enable

    reporter.progress({
        type: 'ProgressFileComplete',
        fileNum: 1,
        fileCount: 1,
        filename: 'text.txt',
        elapsedTimeMs: 349.058747,
        processed: true,
        numErrors: 2,
    });

    await reporter.result({
        files: 1,
        filesWithIssues: new Set(['text.txt']),
        issues: 2,
        errors: 1,
        cachedFiles: 0,
    });
}
