import { expect } from 'chai';
import { traceWords, getDefaultSettings } from '.';
import { toArray } from 'rxjs/operators';

describe('Verify trace', () => {
    it('tests tracing a word', async () => {
        const words = ['apple'];
        const config = getDefaultSettings();
        const result = await traceWords(words, config)
            .pipe(toArray())
            .toPromise();
        expect(result).to.not.be.empty;

        const foundIn = result.filter(r => r.found).map(r => r.dictName);
        expect(foundIn).to.contain('en_US.trie.gz');
    });
});
