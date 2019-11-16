import { expect } from 'chai';
import { streamWordsFromFile } from './iterateWordsFromFile';
import * as path from 'path';

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await streamWordsFromFile(path.join(__dirname, '..', '..', 'Samples', 'hunspell', 'example.aff'), {});
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).to.equal('hello try tried work rework reworked worked');
    });
});
