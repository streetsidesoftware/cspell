import type { YieldResult } from './walkerTypes';
import { hintedWalker } from './hintedWalker';
import { orderTrie, createTriFromList } from '../trie-util';
import { parseLinesToDictionary } from '../SimpleDictionaryParser';

describe('Validate Util Functions', () => {
    test('Hinted Walker', () => {
        const root = createTriFromList(sampleWords);
        orderTrie(root);
        // cspell:ignore joty
        // prefer letters j, o, t, y before the others.
        const i = hintedWalker(root, false, 'joty', undefined);
        let goDeeper = true;
        let ir: IteratorResult<YieldResult>;
        const result: string[] = [];
        while (!(ir = i.next({ goDeeper })).done) {
            const { text, node } = ir.value;
            if (node.f) {
                result.push(text);
            }
            goDeeper = text.length < 4;
        }
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
        let goDeeper = true;
        let ir: IteratorResult<YieldResult>;
        const result: string[] = [];
        while (!(ir = i.next({ goDeeper })).done) {
            const { text, node } = ir.value;
            if (node.f) {
                result.push(text);
            }
            goDeeper = text.length < 4;
        }
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
        const i = hintedWalker(trie.root, false, 'a', undefined, sep);
        let goDeeper = true;
        let ir: IteratorResult<YieldResult>;
        const result: string[] = [];
        while (!(ir = i.next({ goDeeper })).done) {
            const { text, node } = ir.value;
            if (node.f) {
                result.push(text);
            }
            goDeeper = text.split(sep).join('').length < depth;
        }
        expect(result).toEqual(expected);
    });

    test('Hinted Walker compounds ignoreCase', () => {
        const dict = ['A*', '+a*', '*b*', '+c'];
        const trie = parseLinesToDictionary(dict, { stripCaseAndAccents: true });
        const i = hintedWalker(trie.root, true, 'a', undefined);
        let goDeeper = true;
        let ir: IteratorResult<YieldResult>;
        const result: string[] = [];
        while (!(ir = i.next({ goDeeper })).done) {
            const { text, node } = ir.value;
            if (node.f) {
                result.push(text);
            }
            goDeeper = text.length < 2;
        }
        expect(result).toEqual(['A', 'Aa', 'Ab', 'Ac', 'b', 'ba', 'bb', 'bc', 'a', 'aa', 'ab', 'ac']);
    });
});

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
