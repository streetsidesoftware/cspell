import * as path from 'path';

import * as Aff from './aff';
import * as AffReader from './affReader';
import { IterableHunspellReader } from './IterableHunspellReader';

describe('HunspellReader NL', function () {
    // We are reading big files, so we need to give it some time.
    jest.setTimeout(10000);

    const affFile = path.join(__dirname, ...'/../dictionaries/nl.aff'.split('/'));
    // const dicFile = path.join(__dirname, ...'/../dictionaries/nl.dic'.split('/'));
    const pAff = AffReader.parseAffFileToAff(affFile);

    // cspell:ignore baddoek baddoeken

    it('tests transforming some entries', async () => {
        const aff = await pAff;
        const reader = new IterableHunspellReader({ aff, dic: ['baddoek/Zb'] });
        const words = [...reader];
        expect(words).toEqual(['baddoek', 'baddoeken', 'baddoeken-']);
    });

    // cspell:ignore ABCM

    it('tests transforming some entries with debug signatures', async () => {
        const aff = await pAff;
        const reader = new IterableHunspellReader({ aff, dic: ['baddoek/Zb'] });
        const words = [...reader.seqAffWords()].map((w) => Aff.debug.signature(w));
        expect(words).toEqual(['baddoek|', 'baddoeken|BCM', 'baddoeken-|BCM']);
    });
});
