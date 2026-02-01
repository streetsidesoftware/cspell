import type { CSpellReporter, ReporterSettings } from '@cspell/cspell-types';
import { describe, expect, test, vi } from 'vitest';

import { ApplicationError } from '../util/errors.js';
import { loadReporters } from './reporters.js';

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
    test('loadReporters', async () => {
        const reporters: ReporterSettings[] = [['@cspell/cspell-json-reporter', { outFile: 'out.json' }]];
        const loaded = await loadReporters(reporters, defaultReporter, {});
        expect(loaded).toEqual([expect.objectContaining({})]);
    });

    test.each`
        reporter                                   | expected
        ${['@cspell/cspell-json-reporter', false]} | ${new ApplicationError('Failed to load reporter @cspell/cspell-json-reporter: cspell-json-reporter settings must be an object')}
        ${['@cspell/cspell-unknown-reporter']}     | ${oc({ message: sc("Failed to load reporter @cspell/cspell-unknown-reporter: Cannot find package '@cspell/cspell-unknown-reporter' imported from") })}
        ${'@cspell/cspell-unknown-reporter'}       | ${oc({ message: sc("Failed to load reporter @cspell/cspell-unknown-reporter: Cannot find package '@cspell/cspell-unknown-reporter'") })}
    `('loadReporters fail $reporter', async ({ reporter, expected }) => {
        const reporters: ReporterSettings[] = [reporter];
        const r = loadReporters(reporters, defaultReporter, {});
        await expect(r).rejects.toEqual(expected);
    });
});
