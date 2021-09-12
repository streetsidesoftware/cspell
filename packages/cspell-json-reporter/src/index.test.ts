import { getReporter } from '.';
import { CSpellReporter, MessageTypes } from '@cspell/cspell-types';
import * as path from 'path';

function runReporter(reporter: CSpellReporter): void {
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
        doc: 'This text is fulll of errrorrrs.',
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

    reporter.result({
        files: 1,
        filesWithIssues: new Set(['text.txt']),
        issues: 2,
        errors: 1,
    });
}

jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn().mockReturnValue(undefined),
    },
}));

import { promises as fs } from 'fs';

describe('getReporter', () => {
    it('throws for invalid config', () => {
        expect(() => getReporter({})).toThrowErrorMatchingSnapshot();
    });

    it('saves json to file', () => {
        const reporter = getReporter({ outFile: 'out.json' });
        runReporter(reporter);
        expect(fs.writeFile).toBeCalledTimes(1);

        expect((fs.writeFile as jest.Mock).mock.calls[0][0]).toEqual(path.join(process.cwd(), 'out.json'));
        expect((fs.writeFile as jest.Mock).mock.calls[0][1]).toMatchSnapshot();
    });

    it('saves additional data', () => {
        const reporter = getReporter({ outFile: 'out.json', verbose: true, debug: true, progress: true });
        runReporter(reporter);
        expect(fs.writeFile).toBeCalledTimes(1);
        expect((fs.writeFile as jest.Mock).mock.calls[0][0]).toEqual(path.join(process.cwd(), 'out.json'));
        expect((fs.writeFile as jest.Mock).mock.calls[0][1]).toMatchSnapshot();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
