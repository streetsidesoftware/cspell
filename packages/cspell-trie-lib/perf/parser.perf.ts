import fs from 'node:fs/promises';

import { suite } from 'perf-insight';

import { parseDictionaryLines } from '../src/index.ts';

const pkgRoot = new URL('../', import.meta.url);
const urlFixtures = new URL('fixtures/', pkgRoot);
const urlFixDictionaries = new URL('dictionaries/', urlFixtures);

suite('parse dictionary', async (test) => {
    const contentCompanies = await fs.readFile(new URL('companies/companies.txt', urlFixDictionaries), 'utf8');

    test('parseDictionaryLines', () => {
        return [...parseDictionaryLines(contentCompanies)];
    });

    test('parseDictionaryLines sorted 32', () => {
        return [...parseDictionaryLines(contentCompanies, { sortBatchSize: 32 })];
    });

    test('parseDictionaryLines sorted 1000', () => {
        return [...parseDictionaryLines(contentCompanies, { sortBatchSize: 1000 })];
    });
});
