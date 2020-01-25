import {walker, YieldResult, hintedWalker} from './walker';
import {orderTrie, createTriFromList} from './util';

describe('Validate Util Functions', () => {
    test('Tests Walker', () => {
        const root = createTriFromList(sampleWords);
        orderTrie(root);
        const i = walker(root);
        let goDeeper = true;
        let ir: IteratorResult<YieldResult>;
        const result: string[] = [];
        while (!(ir = i.next(goDeeper)).done) {
            const { text, node } = ir.value;
            if (node.f) {
                result.push(text);
            }
            goDeeper = text.length < 4;
        }
        expect(result).toEqual(sampleWords.filter(a => a.length <= 4).sort());
    });

    test('Test Hinted Walker', () => {
        const root = createTriFromList(sampleWords);
        orderTrie(root);
        // cspell:ignore joty
        // prefer letters j, o, t, y before the others.
        const i = hintedWalker(root, undefined, 'joty');
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
        expect(result).toEqual('joy jowl talk lift walk'.split(' '));
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
