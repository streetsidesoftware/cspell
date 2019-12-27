import { createReader } from './Reader';
import * as path from 'path';

const samples = path.join(__dirname, '..', '..', '..', 'Samples', 'dicts');

describe('Validate the iterateWordsFromFile', () => {
    test('streamWordsFromFile: hunspell', async () => {
        const reader = await createReader(path.join(samples, 'hunspell', 'example.aff'), {});
        expect(reader.size).toBe(3);
        const results = [...reader];
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe('hello tried try rework reworked work worked');
    });

    test('stream words from trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), {});
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader];
        expect(results.join('|')).toBe('amsterdam|angeles|city|delhi|francisco|london|los|los angeles'
            + '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york');
    });

    test('annotatedWords: hunspell', async () => {
        const reader = await createReader(path.join(samples, 'hunspell', 'example.aff'), {});
        expect(reader.size).toBe(3);
        const words = [...reader.annotatedWords()];
        const results = words.map(a => a.word);
        // this might break if the processing order of hunspell changes.
        expect(results.join(' ')).toBe('hello tried try rework reworked work worked');
    });

    test('annotatedWords: trie', async () => {
        const reader = await createReader(path.join(samples, 'cities.trie.gz'), {});
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader.annotatedWords()].map(a => a.word);
        expect(results.join('|')).toBe('amsterdam|angeles|city|delhi|francisco|london|los|los angeles'
            + '|mexico|mexico city|new|new amsterdam|new delhi|new york|paris|san|san francisco|york');
    });

    test('annotatedWords: text', async () => {
        const reader = await createReader(path.join(samples, 'cities.txt'), {});
        expect(reader.size).toBeGreaterThan(1);
        const results = [...reader.annotatedWords()].map(a => a.word);
        expect(results.join('|')).toBe('New York|New Amsterdam|Los Angeles|San Francisco|New Delhi|Mexico City|London|Paris|');
    });

});
