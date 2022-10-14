// cSpell:ignore jpegs outing dirs lcode outring outrings

import { toArray } from '@cspell/cspell-pipe/sync';
import { createSortAndFilterOperation } from './wordListParser';

describe('Validate the wordListCompiler', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each`
        lines                   | strict   | expectedResult
        ${'Apple|~apple|Apple'} | ${true}  | ${['Apple']}
        ${'Apple|~apple|Apple'} | ${false} | ${'Apple|~apple'}
        ${'hello'}              | ${false} | ${['hello']}
    `(
        'createSortAndFilterOperation $lines',
        ({ lines, strict, expectedResult }: { lines: string; strict: boolean; expectedResult: string[] | string }) => {
            const normalizer = createSortAndFilterOperation({ sort: true, stripNonStrictPrefix: strict });
            const r = toArray(normalizer(s(lines)));
            expect(r).toEqual(s(expectedResult).sort());
        }
    );
});

function s(values: string | string[]): string[] {
    return Array.isArray(values) ? values : values.split(/[\n|]/g);
}
