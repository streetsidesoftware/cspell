import assert from 'assert';
import { mapDictionaryInformationToWeightMap, SuggestionResult, WeightMap } from '..';
import { readRawDictionaryFile, readSampleTrie } from '../../test/dictionaries.test.helper';
import { DictionaryInformation } from '../models/DictionaryInformation';
import { clean } from '../utils/util';
import { DEFAULT_COMPOUNDED_WORD_SEPARATOR } from './suggestCollector';

function getTrie() {
    return readSampleTrie('nl_nl.trie.gz');
}

const timeout = 5000;
const pTrieNL = getTrie();

const pAffContent = readRawDictionaryFile('hunspell/Dutch.aff');

let affContent: string | undefined;

const pReady = Promise.all([pTrieNL, pAffContent.then((aff) => (affContent = aff))]).then(() => {
    return undefined;
});

const ac = expect.arrayContaining;

describe('Validate Dutch Suggestions', () => {
    // cspell:ignore buurtbewoners
    test(
        'Tests suggestions "buurtbewoners"',
        async () => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost('buurtbewoners', { numSuggestions: 5 });
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners']));
            expect(suggestions[0]).toBe('buurtbewoners');
        },
        timeout
    );

    // cspell:ignore burtbewoners burgbewoners
    // cspell:ignore buurtbwoners buurtbewoner buurbewoners
    // cspell:ignore bultbewoners buutbewoners

    test.each`
        word               | numSuggestions | expected
        ${'Mexico-Stad'}   | ${2}           | ${[sr('Mexico-Stad', 0), sr('mexico-stad', 2)]}
        ${'mexico-stad'}   | ${2}           | ${[sr('mexico-stad', 0), sr('Mexico-Stad', 2)]}
        ${'buurtbewoners'} | ${3}           | ${[sr('buurtbewoners', 0), sr('buurtbewoner', 88), sr('buurbewoners', 96)]}
        ${'burtbewoners'}  | ${2}           | ${[sr('bultbewoners', 97), sr('buutbewoners', 97), sr('buurtbewoners', 97)]}
        ${'buurtbwoners'}  | ${1}           | ${[sr('buurtbewoners', 93)]}
        ${'buurtbewoners'} | ${1}           | ${[sr('buurtbewoners', 0)]}
        ${'positive'}      | ${4}           | ${ac([sr('positivo', 92), sr('positieve', 93), sr('positie', 94)])}
        ${'kostelos'}      | ${3}           | ${ac([sr('kosteloos', 92)])}
    `(
        'Tests suggestions $word',
        async ({ word, numSuggestions, expected }) => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost(word, { numSuggestions, includeTies: true });
            expect(results).toEqual(expected);
        },
        timeout
    );

    // cspell:ignore mexico stad
    test(
        'Tests suggestions "mexico-stad"',
        async () => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost('mexico-stad', { numSuggestions: 2 });
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['Mexico-Stad']));
            expect(suggestions).not.toEqual(expect.arrayContaining(['Mexico-stad']));
        },
        timeout
    );

    function sr(word: string, cost: number, compoundWord?: string): SuggestionResult {
        return clean({ word, cost, compoundWord: compoundWord?.replace(/[|+]/g, DEFAULT_COMPOUNDED_WORD_SEPARATOR) });
    }

    // cspell:ignore buurt kasteloos kosten maan
    // cspell:ignore baan buurbaan Buurma buurmans
    test.each`
        word             | expected
        ${'buurt'}       | ${[sr('buurt', 0), sr('beurt', 40), sr('buut', 70), sr('brut', 75)]}
        ${'eén'}         | ${ac([sr('een', 1)])}
        ${'buurman'}     | ${[sr('buurman', 0), sr('Buurma', 76), sr('buurmaan', 95, 'buur|maan'), sr('buurmans', 100)]}
        ${'buurmaan'}    | ${ac([sr('buurman', 45), sr('buurmaan', 50, 'buur|maan'), sr('buurbaan', 75, 'buur|baan')])}
        ${'positeve'}    | ${ac([sr('positieve', 45), sr('positieven', 90)])}
        ${'positieven'}  | ${ac([sr('positieven', 0), sr('positieve', 45)])}
        ${'positive'}    | ${ac([sr('positieve', 45)])}
        ${'verklaaring'} | ${ac([sr('verklaring', 45)])}
        ${'Mexico-Stad'} | ${ac([sr('Mexico-Stad', 0)])}
        ${'mexico-stad'} | ${ac([sr('Mexico-Stad', 2), sr('Mexico-stad', 51, 'Mexico-|stad')])}
        ${'word'}        | ${ac([sr('word', 0), sr('wordt', 30)])}
        ${'kostelos'}    | ${ac([sr('kosteloos', 45) /*, sr('kostenloos', 90) */])}
        ${'kosteloos'}   | ${ac([sr('kosteloos', 0), sr('kasteloos', 50), sr('kostenloos', 95, 'kosten|loos')])}
    `('Weighted Results "$word"', async ({ word, expected }) => {
        await pReady;
        const trie = await pTrieNL;
        const results = trie.suggestWithCost(word, {
            numSuggestions: 8,
            weightMap: weightMapFromAff(),
            ignoreCase: false,
        });
        const suggestions = results;
        suggestions.length = Math.min(suggestions.length, 4);
        expect(suggestions).toEqual(expected);
    });
});

const defaultDictInfo: DictionaryInformation = {
    locale: 'nl-NL',
    suggestionEditCosts: [
        {
            map: 'aeiou',
            replace: 50,
            insDel: 50,
        },
        {
            map: 'o(oo)|a(aa)|e(ee)|u(uu)|(eu)(uu)|(ou)(ui)|(ie)(ei)|i(ie)|e(en)|e(ie)',
            replace: 45,
        },
        {
            map: '(eur)(uur)',
            replace: 40,
        },
        {
            map: 'aeiou',
            replace: 90,
        },
        {
            map: '(d$)(t$)(dt$)',
            replace: 30,
        },
    ],
};

let __weightMapFromAff: WeightMap | undefined;

function weightMapFromAff(): WeightMap {
    if (__weightMapFromAff) return __weightMapFromAff;
    assert(affContent);

    const di: DictionaryInformation = {
        ...defaultDictInfo,
        hunspellInformation: {
            aff: affContent,
        },
    };

    return (__weightMapFromAff = mapDictionaryInformationToWeightMap(di));
}
// cspell:ignore conv OCONV
// cspell:ignore aeiou positeve buurmaan buurman buurmaag buurmaat buurmaand beurt buur buut positie positieve
// cspell:ignore positieven positiever positivo verklaaring verklaring wordt kosteloos kostelos kostenloos
