import { expect } from 'chai';
import { traceWords, getDefaultSettings } from '.';

describe('Verify trace', () => {
    jest.setTimeout(10000);
    test('tests tracing a word', async () => {
        const words = ['apple'];
        const config = getDefaultSettings();
        const result = await traceWords(words, config);
        expect(result).to.not.be.empty;

        const foundIn = result.filter(r => r.found).map(r => r.dictName);
        expect(foundIn).to.contain('en_US.trie.gz');
    });
});
