import * as path from 'path';
import { describe, expect, it } from 'vitest';

import * as Aff from './affLegacy.js';
import * as AffReader from './affReader.js';
import { IterableHunspellReaderLegacy } from './IterableHunspellReaderLegacy.js';

const timeout = 10000;

describe('HunspellReader NL', function () {
    // We are reading big files, so we need to give it some time.

    const affFile = path.join(__dirname, ...'/../dictionaries/nl.aff'.split('/'));
    // const dicFile = path.join(__dirname, ...'/../dictionaries/nl.dic'.split('/'));
    const pAff = AffReader.parseAffFileToAffLegacy(affFile);

    // cspell:ignore baddoek baddoeken

    it(
        'tests transforming some entries',
        async () => {
            const aff = await pAff;
            const reader = new IterableHunspellReaderLegacy({ aff, dic: ['baddoek/Zb'] });
            const words = [...reader];
            expect(words).toEqual(['baddoek', 'baddoeken', 'baddoeken-']);
        },
        timeout,
    );

    // cspell:ignore ABCM

    it(
        'tests transforming some entries with debug signatures',
        async () => {
            const aff = await pAff;
            const reader = new IterableHunspellReaderLegacy({ aff, dic: ['baddoek/Zb'] });
            const words = [...reader.seqAffWords()].map((w) => Aff.debug.signature(w));
            expect(words).toEqual(['baddoek|', 'baddoeken|BCM', 'baddoeken-|BCM']);
        },
        timeout,
    );
});
