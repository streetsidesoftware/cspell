import type { CSpellReporter, ReporterSettings } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { describe, expect, test, vi } from 'vitest';

import { InMemoryReporter } from './InMemoryReporter.js';
import { loadReporters, mergeReporters } from './reporters.js';

const defaultReporter: CSpellReporter = {
    issue: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    progress: vi.fn(),
    result: vi.fn(),
};

const oc = (obj: unknown) => expect.objectContaining(obj);
const sc = (s: string) => expect.stringContaining(s);

describe('mergeReporters', () => {
    test('processes a single reporter', async () => {
        const reporter = new InMemoryReporter();
        await runReporter(mergeReporters(reporter));

        expect(reporter.dump()).toMatchSnapshot();
    });

    test('processes a multiple reporters', async () => {
        const reporters = [new InMemoryReporter(), new InMemoryReporter(), new InMemoryReporter()];
        await runReporter(mergeReporters(...reporters));

        reporters.forEach((reporter) => {
            expect(reporter.dump()).toMatchSnapshot();
        });
    });

    test('loadReporters', async () => {
        const reporters: ReporterSettings[] = [['@cspell/cspell-json-reporter', { outFile: 'out.json' }]];
        const loaded = await loadReporters(reporters, defaultReporter, {});
        expect(loaded).toEqual([expect.objectContaining({})]);
    });

    test.each`
        reporter                                   | expected
        ${['@cspell/cspell-json-reporter', false]} | ${Error('Failed to load reporter @cspell/cspell-json-reporter: cspell-json-reporter settings must be an object')}
        ${['@cspell/cspell-unknown-reporter']}     | ${oc({ message: sc("Failed to load reporter @cspell/cspell-unknown-reporter: Cannot find package '@cspell/cspell-unknown-reporter' imported from") })}
        ${'@cspell/cspell-unknown-reporter'}       | ${oc({ message: sc("Failed to load reporter @cspell/cspell-unknown-reporter: Cannot find package '@cspell/cspell-unknown-reporter'") })}
    `('loadReporters fail $reporter', async ({ reporter, expected }) => {
        const reporters: ReporterSettings[] = [reporter];
        const r = loadReporters(reporters, defaultReporter, {});
        await expect(r).rejects.toEqual(expected);
    });
});

async function runReporter(reporter: CSpellReporter): Promise<void> {
    reporter.debug?.('foo');
    reporter.debug?.('bar');

    reporter.error?.('something went wrong', new Error('oh geez'));

    reporter.info?.('some logs', MessageTypes.Info);
    reporter.info?.('some warnings', MessageTypes.Warning);
    reporter.info?.('some debug logs', MessageTypes.Debug);

    // cSpell:disable
    reporter.issue?.({
        text: 'fulll',
        offset: 13,
        line: { text: 'This text is fulll of errrorrrs.', offset: 0 },
        row: 1,
        col: 14,
        uri: 'text.txt',
        context: { text: 'This text is fulll of errrorrrs.', offset: 0 },
    });
    // cSpell:enable

    reporter.progress?.({
        type: 'ProgressFileComplete',
        fileNum: 1,
        fileCount: 1,
        filename: 'text.txt',
        elapsedTimeMs: 349.058747,
        processed: true,
        numErrors: 2,
    });

    await reporter.result?.({
        files: 1,
        filesWithIssues: new Set(['text.txt']),
        issues: 2,
        errors: 1,
        cachedFiles: 0,
    });
}
