import type { CSpellReporter } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { InMemoryReporter } from './InMemoryReporter';
import { mergeReporters } from './reporters';

describe('mergeReporters', () => {
    it('processes a single reporter', async () => {
        const reporter = new InMemoryReporter();
        await runReporter(mergeReporters(reporter));

        expect(reporter.dump()).toMatchSnapshot();
    });

    it('processes a multiple reporters', async () => {
        const reporters = [new InMemoryReporter(), new InMemoryReporter(), new InMemoryReporter()];
        await runReporter(mergeReporters(...reporters));

        reporters.forEach((reporter) => {
            expect(reporter.dump()).toMatchSnapshot();
        });
    });
});

async function runReporter(reporter: CSpellReporter): Promise<void> {
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
    });
}
