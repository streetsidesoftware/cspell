import { streamWordsFromFile } from './iterateWordsFromFile';
import * as path from 'path';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await streamWordsFromFile(path.join(samples, 'hunspell', 'example.aff'), {});
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe('hello tried try rework reworked work worked');
    });

    test('stream words from trie', async () => {
        const reader = await streamWordsFromFile(path.join(samples, 'cities.trie.gz'), {});
        const results = [...reader];
        expect(results.join('|')).toBe(
            'amsterdam|angeles|city|delhi|francisco|london|los|los angeles' +
                '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york'
        );
    });
});
