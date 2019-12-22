import * as Trie from '.';
import { serializeTrie, importTrie } from './importExport';
import { readFile } from 'fs-extra';
import * as path from 'path';

describe('Import/Export', () => {
    const pSampleWords = readFile(path.join(__dirname, '..', '..', 'Samples', 'sample.txt'), 'UTF-8');
    test('tests serialize / deserialize V1', async () => {
        const sampleWords = (await pSampleWords).split('\n').filter(a => !!a);
        const trie = Trie.createTriFromList(sampleWords);
        const data = [...serializeTrie(trie, 10)];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize V2', async () => {
        const sampleWords = (await pSampleWords).split('\n').filter(a => !!a);
        const trie = Trie.createTriFromList(sampleWords);
        const data = [...serializeTrie(trie, { version: 2, base: 10, comment: 'Sample Words' })];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize unknown version', async () => {
        const sampleWords = (await pSampleWords).split('\n').filter(a => !!a);
        const trie = Trie.createTriFromList(sampleWords);
        const dataFn = () => serializeTrie(trie, { version: 99, base: 10, comment: 'Sample Words' });
        expect(dataFn).toThrow('Unknown version: 99');
    });

    test('bad format', async() => {
        const data = ['One', 'Two'];
        expect(() => importTrie(data)).toThrow('Unknown file format');
    });

    test('Unsupported version', async() => {
        const sample = await readFile(path.join(__dirname, '..', '..', 'Samples', 'sampleV2.trie'), 'UTF-8');
        const data = sample.replace('TrieXv2', 'TrieXv9').split('\n');
        expect(() => importTrie(data)).toThrow('Unsupported version: 9');
    });
});
