import { genSequence } from 'gensequence';
import { describe, expect, test } from 'vitest';

import { consolidate } from './consolidate.js';
import { convertToTrieRefNodes } from './convertToTrieRefNodes.js';
import { createTrieFromList } from './TrieNode/trie-util.js';
import type { TrieRefNode } from './trieRef.js';

describe('Validate convertToTrieRefNodes', () => {
    test('Simple Convert', () => {
        const trie = consolidate(createTrieFromList(sampleWords));
        const nodes = [...convertToTrieRefNodes(trie)];
        expect(nodes).toHaveLength(96);
        const words = [...walk(nodes)];
        expect(words).toEqual(sampleWords.sort());
    });
});

function walk(nodes: TrieRefNode[]): IterableIterator<string> {
    function* w(node: TrieRefNode, prefix: string): IterableIterator<string> {
        if (node.f) {
            yield prefix;
        }
        if (node.r) {
            yield* genSequence(node.r).concatMap((a) =>
                genSequence(w(nodes[a[1]], a[0])).map((suffix) => prefix + suffix)
            );
        }
    }
    return w(nodes[nodes.length - 1], '');
}

const sampleWords = [
    'journal',
    'journalism',
    'journalist',
    'journalistic',
    'journals',
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
    'lift',
    'lifted',
    'lifter',
    'lifting',
    'lifts',
    'talk',
    'talked',
    'talker',
    'talking',
    'talks',
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'Big Apple',
    'New York',
    'apple',
    'big apple',
    'fun journey',
    'long walk',
    'fun walk',
];
