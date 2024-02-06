import { promises as fs } from 'fs';
import iconv from 'iconv-lite';
import * as path from 'path';
import { describe, expect, it, test } from 'vitest';

import type { AffInfo } from './affDef.js';
import { parseAffFile } from './affReader.js';
import type { SuffixTree } from './AffSuffixTreeCompiler.js';
import {
    AffSuffixTreeCompiler,
    createRoot,
    serializedSuffixTree,
    serializedSuffixTreeWords,
} from './AffSuffixTreeCompiler.js';

const DICTIONARY_LOCATIONS = path.join(__dirname, '../dictionaries');
const TEST_FIXTURES_DIR = path.join(__dirname, '../fixtures/tests');
const nlAff = path.join(DICTIONARY_LOCATIONS, 'nl.aff');
// const enAff = path.join(DICTIONARY_LOCATIONS, 'en_US.aff');
// const enGbAff = path.join(DICTIONARY_LOCATIONS, 'en_GB.aff');
// const esAff = path.join(DICTIONARY_LOCATIONS, 'es_ANY.aff');
// const frAff = path.join(DICTIONARY_LOCATIONS, 'fr-moderne.aff');
// const huAff = path.join(DICTIONARY_LOCATIONS, 'hu/hu.aff');
const huHuAff = path.join(DICTIONARY_LOCATIONS, 'hu_hu/hu_HU.aff');
const basqueAff = path.join(DICTIONARY_LOCATIONS, 'eu/eu.aff');

describe('AffSuffixTreeCompiler', () => {
    it('tests applying rules for nl huis', async () => {
        const aff = await parseAffToSuffixTreeCompiler(nlAff);
        const line = 'huis/CACcYbCQZhC0';
        const tree = aff.dictEntryToSuffixTree(line);
        expect(tree.getRoot()).toMatchSnapshot();

        const next = aff.dictEntryToSuffixTree(line, tree);
        expect(next).toBe(tree);

        // cspell:ignore huishouden huishoud huur CACBC0
        aff.dictEntryToSuffixTree('huishouden/Vi', tree);
        aff.dictEntryToSuffixTree('huishoud/V3', tree);
        aff.dictEntryToSuffixTree('huishoud/CACBC0', tree);
        aff.dictEntryToSuffixTree('huur/PjV3VpVp', tree);

        const serialized = serializedSuffixTree(tree);
        console.log('Suffix Tree: %o', serialized);
        console.log('Suffix Tree Words: %o', [...serializedSuffixTreeWords(serialized, '|')]);
    });

    it.only('applyRulesToDicEntry Basque', async () => {
        const aff = await parseAffToSuffixTreeCompiler(basqueAff);
        // cspell:disable
        const lines = [
            'farsaliarr/34,1',
            'farsaliar/35,1',
            // 'farsaliarr/13,1',
            // 'farsaliar/14,1',
            // 'farsiera/11,1',
            // 'farsier/12,1',
            // 'fartet/68,1',
            // 'farte/69,1',
            // 'fartleg/18,1',
            // 'fartlek/92,1',
            // 'fartle/93,1',
            // 'fartsa/11,1',
            // 'farts/12,1',
            // 'fascia/11,1',
            // 'fasciola/11,1',
            // 'fasciol/12,1',
            // 'fasci/15,1',
        ];
        // cspell:enable
        const tree = lines.reduce<SuffixTree>((tree, line) => aff.dictEntryToSuffixTree(line, tree), createRoot());
        const serialized = serializedSuffixTree(tree);
        console.log('Suffix Tree: %o', serialized);
        console.log('Suffix Tree Words: %o', [...serializedSuffixTreeWords(serialized, '|')]);
        expect(tree).toBeDefined();
    });

    it('applyRulesToDicEntry Hungarian', async () => {
        const aff = await parseAffToSuffixTreeCompiler(huHuAff);
        // cspell:disable
        const lines = ['öntőműhely/VËŻj×LÓnňéyČŔŕTtYcź'];
        // cspell:enable
        const tree = lines.reduce<SuffixTree>((tree, line) => aff.dictEntryToSuffixTree(line, tree, 2), createRoot());
        console.log('Suffix Tree: %o', serializedSuffixTree(tree));
        expect(tree).toBeDefined();
    });

    test('base', async () => {
        const debug = true;
        const fixture = 'base';
        const info = fixtureInfo(fixture);
        const aff = await parseAffToSuffixTreeCompiler(info.aff);
        const lines = debug ? ['create/XKVNGADS'] : await readDictLines(info.dic, aff.affInfo.SET);
        const tree = lines.reduce<SuffixTree>((tree, line) => aff.dictEntryToSuffixTree(line, tree, 2), createRoot());
        const serialized = serializedSuffixTree(tree);
        console.log('Suffix Tree: %o', serialized);
        console.log('Suffix Tree Words: %o', [...serializedSuffixTreeWords(serialized, '|')]);
        expect(tree).toBeDefined();
    });
});

const affInfoCache = new Map<string, Promise<AffInfo>>();

function readAffInfo(affFile: string) {
    const found = affInfoCache.get(affFile);
    if (found) {
        return found;
    }
    const affInfo = parseAffFile(affFile);
    affInfoCache.set(affFile, affInfo);
    return affInfo;
}

async function parseAffToSuffixTreeCompiler(affFile: string) {
    const affInfo = await readAffInfo(affFile);
    const aff = new AffSuffixTreeCompiler(affInfo, affFile);
    return aff;
}

const regExpIsNumber = /^\d+$/;

async function readDictLines(dictFile: string, encoding: string | undefined) {
    const dict = iconv.decode(await fs.readFile(dictFile), encoding || 'utf-8');
    const lines = dict.split('\n');
    return lines
        .map((line) => line.trim())
        .filter((line) => !!line)
        .filter((line) => !regExpIsNumber.test(line));
}

// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings
// cspell:enableCompoundWords

function fixtureInfo(fixtureName: string) {
    return {
        aff: path.join(TEST_FIXTURES_DIR, fixtureName + '.aff'),
        dic: path.join(TEST_FIXTURES_DIR, fixtureName + '.dic'),
        good: path.join(TEST_FIXTURES_DIR, fixtureName + '.good.txt'),
        wrong: path.join(TEST_FIXTURES_DIR, fixtureName + '.wrong.txt'),
    };
}
