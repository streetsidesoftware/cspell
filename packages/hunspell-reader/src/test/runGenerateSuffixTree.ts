import * as path from 'path';
import { fileURLToPath } from 'url';

import type { AffInfo } from '../affDef.js';
import { parseAffFile } from '../affReader.js';
import type { SuffixTree } from '../AffSuffixTreeCompiler.js';
import {
    AffSuffixTreeCompiler,
    createRoot,
    serializedSuffixTree,
    serializedSuffixTreeWords,
} from '../AffSuffixTreeCompiler.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const DICTIONARY_LOCATIONS = path.join(__dirname, '../../dictionaries');
const basqueAff = path.join(DICTIONARY_LOCATIONS, 'eu/eu.aff');

const affInfoCache = new Map<string, Promise<AffInfo>>();
run();

async function run() {
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
}

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
