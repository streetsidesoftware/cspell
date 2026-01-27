import * as path from 'node:path';

import { opFilter, opTake, pipe } from '@cspell/cspell-pipe/sync';
import { describe, expect, test } from 'vitest';

import { test_dirname } from '../test/TestHelper.ts';
import { createReader } from './Reader.ts';
import type { ReaderOptions } from './readers/ReaderOptions.ts';

const _dirname = test_dirname(import.meta.url);

const samples = path.join(_dirname, '../../../../fixtures/Samples/dicts');

const readerOptions: ReaderOptions = {};

describe('Validate the Reader with Dutch', () => {
    const pReaderDutch = createReader(path.join(samples, 'hunspell', 'Dutch.aff'), readerOptions);

    test('annotatedWords: hunspell Dutch', async () => {
        const reader = await pReaderDutch;
        const regBoek = /^.?boek.{0,2}\b/i; // cspell:ignore boek boeken boeker boeket boekje
        const results = [
            ...pipe(
                reader.lines,
                opFilter((word) => regBoek.test(word)),
                opTake(8),
            ),
        ];
        expect(results.join(' ')).toBe('+boek +boeken +boeken+ +boeken- +boeken-+ +boeker +boeket +boekje');
    });
});
