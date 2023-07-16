import { describe, expect, test } from 'vitest';

import { Trie } from '../trie.js';
import { isWordTerminationNode } from '../TrieNode/trie-util.js';
import type { TrieNode } from '../TrieNode/TrieNode.js';
import { walker } from '../walker/index.js';
import * as Sug from './suggest.js';
import type { SuggestionResultBase } from './SuggestionTypes.js';

describe('Validate Suggest', () => {
    const trie = Trie.create(sampleWords);
    // cspell:ignore tallk jernals juornals joyfull
    test.each`
        word
        ${'talks'}
        ${'tallk'}
        ${'jernals'}
        ${'juornals'}
        ${'joyfull'}
        ${''}
    `('Tests suggestions against Legacy Suggestion generator "$word"', ({ word }) => {
        const results = Sug.suggest(trie.root, word);
        // results for ${word}
        expect(results).toEqual(legacySuggest(trie.root, word));
    });
});

const sampleWords = [
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'talk',
    'talks',
    'talked',
    'talker',
    'talking',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'journal',
    'journals',
    'journalism',
    'journalist',
    'journalistic',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfully',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
];

const defaultMaxNumberSuggestions = 10;

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;
const MAX_NUM_CHANGES = 5;

function legacySuggest(
    root: TrieNode,
    word: string,
    maxNumSuggestions: number = defaultMaxNumberSuggestions,
): SuggestionResultBase[] {
    const bc = baseCost;
    const psc = postSwapCost;
    const sugs: SuggestionResultBase[] = [];
    const matrix: number[][] = [[]];
    const x = ' ' + word;
    const mx = x.length - 1;

    let costLimit = Math.min((bc * word.length) / 2, bc * MAX_NUM_CHANGES);

    function comp(a: SuggestionResultBase, b: SuggestionResultBase): number {
        return a.cost - b.cost || a.word.length - b.word.length || (a.word < b.word ? -1 : 1);
    }

    function emitSug(sug: SuggestionResultBase) {
        sugs.push(sug);
        if (sugs.length > maxNumSuggestions) {
            sugs.sort(comp);
            sugs.length = maxNumSuggestions;
            costLimit = sugs[sugs.length - 1].cost;
        }
    }

    for (let i = 0; i <= mx; ++i) {
        matrix[0][i] = i * baseCost;
    }

    const i = walker(root);
    let deeper = true;
    for (let r = i.next(deeper); !r.done; r = i.next(deeper)) {
        const { text, node, depth } = r.value;
        const d = depth + 1;
        const lastSugLetter = d > 1 ? text[d - 2] : '';
        const w = text.slice(-1);
        matrix[d] = matrix[d] || [];
        matrix[d][0] = matrix[d - 1][0] + bc;
        let lastLetter = x[0];
        let min = matrix[d][0];
        for (let i = 1; i <= mx; ++i) {
            const curLetter = x[i];
            const c = bc - d;
            const subCost = w === curLetter ? 0 : curLetter === lastSugLetter ? (w === lastLetter ? psc : c) : c;
            matrix[d][i] = Math.min(
                matrix[d - 1][i - 1] + subCost, // substitute
                matrix[d - 1][i] + c, // insert
                matrix[d][i - 1] + c, // delete
            );
            min = Math.min(min, matrix[d][i]);
            lastLetter = curLetter;
        }
        const cost = matrix[d][mx];
        if (isWordTerminationNode(node) && cost <= costLimit) {
            emitSug({ word: text, cost });
        }
        deeper = min <= costLimit;
    }
    sugs.sort(comp);
    return sugs;
}
