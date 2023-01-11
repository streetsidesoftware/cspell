import { parseLinesToDictionary } from '../../SimpleDictionaryParser';
import { createTriFromList, orderTrie } from '../../trie-util';
import type { HintedWalkerIterator } from '.';
import { CompoundWordsMethod } from '.';
import { hintedWalker } from './hintedWalker';
import type { YieldResult } from './walkerTypes';

describe('Validate Util Functions', () => {
    test('Hinted Walker', () => {
        const root = createTriFromList(sampleWords);
        orderTrie(root);
        // cspell:ignore joty
        // prefer letters j, o, t, y before the others.
        const i = hintedWalker(root, false, 'joty', undefined);
        const result = walkerToArray(i, 4);
        expect(result).toEqual(s('joy jowl talk lift walk'));
    });

    test.each`
        word        | expected
        ${'joty'}   | ${s('joy jowl talk lift walk')}
        ${'talked'} | ${s('talk lift jowl joy walk')}
    `('Hinted Walker with strange word list: "$word"', ({ word, expected }) => {
        const root = createTriFromList([...sampleWords, 'joy++', 'talk++']);
        orderTrie(root);
        // cspell:ignore joty
        // prefer letters j, o, t, y before the others.
        const i = hintedWalker(root, false, word, undefined);
        const result = walkerToArray(i, 4);
        expect(result).toEqual(expected);
    });

    test.each`
        dict                          | sep    | depth | expected
        ${[]}                         | ${''}  | ${2}  | ${[]}
        ${['A*', '+a*', '*b*', '+c']} | ${''}  | ${2}  | ${['A', 'Aa', 'Ab', 'Ac', 'b', 'ba', 'bb', 'bc']}
        ${['A*', '+a*', '*b*', '+c']} | ${'+'} | ${2}  | ${['A', 'A+a', 'A+b', 'A+c', 'b', 'b+a', 'b+b', 'b+c']}
        ${['A+', '+a*', '+b']}        | ${'•'} | ${3}  | ${['A•a', 'A•a•a', 'A•a•b', 'A•b']}
        ${['A+', '+b+', '+C']}        | ${'•'} | ${5}  | ${['A•C', 'A•b•C', 'A•b•b•C', 'A•b•b•b•C']}
    `('Hinted Walker compounds $dict', ({ dict, sep, depth, expected }) => {
        const trie = parseLinesToDictionary(dict, { stripCaseAndAccents: true });
        const iter = hintedWalker(trie.root, false, 'a', undefined, sep);
        const result = walkerToArray(iter, depth);
        expect(result).toEqual(expected);
    });

    test.each`
        dict                          | ignoreCase | sep    | depth | compoundMethod                        | expected
        ${['A*', '+a*', '*b*', '+c']} | ${true}    | ${''}  | ${2}  | ${undefined}                          | ${['A', 'Aa', 'Ab', 'Ac', 'b', 'ba', 'bb', 'bc', 'a', 'aa', 'ab', 'ac']}
        ${['A*', '+a*', '*b*', '+c']} | ${false}   | ${''}  | ${2}  | ${undefined}                          | ${['A', 'Aa', 'Ab', 'Ac', 'b', 'ba', 'bb', 'bc']}
        ${['A*', '+b+', '+C']}        | ${false}   | ${'•'} | ${3}  | ${CompoundWordsMethod.NONE}           | ${['A', 'A•C', 'A•b•C']}
        ${['A*', '+b+', '+C']}        | ${false}   | ${'•'} | ${3}  | ${CompoundWordsMethod.JOIN_WORDS}     | ${['A', 'A•C', 'A•b•C', 'A+A', 'A+C']}
        ${['A*', '+b+', '+C']}        | ${false}   | ${'•'} | ${3}  | ${CompoundWordsMethod.SEPARATE_WORDS} | ${['A', 'A•C', 'A•b•C', 'A A', 'A C']}
    `(
        'Hinted Walker dict: $dict ignoreCase: $ignoreCase depth: $depth sep: "$sep" method: $compoundMethod',
        ({ dict, ignoreCase, sep, depth, compoundMethod, expected }) => {
            const trie = parseLinesToDictionary(dict, { stripCaseAndAccents: ignoreCase });
            const i = hintedWalker(trie.root, ignoreCase, 'a', compoundMethod, sep);
            const result = walkerToArray(i, depth);
            expect(result).toEqual(expected);
        }
    );
});

function walkerToArray(w: HintedWalkerIterator, depth: number): string[] {
    const maxDepth = depth - 1;
    let goDeeper = true;
    let ir: IteratorResult<YieldResult>;
    const result: string[] = [];
    while (!(ir = w.next({ goDeeper })).done) {
        const { text, node, depth } = ir.value;
        if (node.f) {
            result.push(text);
        }
        goDeeper = depth < maxDepth;
    }
    return result;
}

function s(text: string, splitOn = ' '): string[] {
    return text.split(splitOn);
}

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
