import { opFilter, opTake, pipe } from '@cspell/cspell-pipe/sync';
import * as path from 'path';
import type { ReaderOptions } from './Reader';
import { createReader } from './Reader';

const samples = path.join(__dirname, '../../../Samples/dicts');

const readerOptions: ReaderOptions = {
    splitWords: false,
};

describe('Validate the Reader with Dutch', () => {
    const pReaderDutch = createReader(path.join(samples, 'hunspell', 'Dutch.aff'), readerOptions);

    test('annotatedWords: hunspell Dutch', async () => {
        const reader = await pReaderDutch;
        const regBoek = /^.?boek.{0,2}\b/i; // cspell:ignore boek boeken boeker boeket boekje
        const results = [
            ...pipe(
                reader.words,
                opFilter((word) => regBoek.test(word)),
                opTake(8)
            ),
        ];
        expect(results.join(' ')).toBe('+boek +boeken +boeken+ +boeken- +boeken-+ +boeker +boeket +boekje');
    });
});
