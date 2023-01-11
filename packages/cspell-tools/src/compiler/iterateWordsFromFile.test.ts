import * as path from 'path';

import { streamWordsFromFile } from './iterateWordsFromFile';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await streamWordsFromFile(path.join(samples, 'hunspell/example.aff'), { splitWords: false });
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe('hello rework reworked tried try work worked');
    });

    test('stream words from trie', async () => {
        const reader = await streamWordsFromFile(path.join(samples, 'cities.trie.gz'), { splitWords: false });
        const results = [...reader];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });
});
