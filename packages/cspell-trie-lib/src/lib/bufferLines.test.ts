import { bufferLines } from './bufferLines';

describe('Validate BufferLines', () => {
    test('bufferLines', () => {
        const r = [...bufferLines(bufferLines(sampleWords, 1, ','), 10, '')];
        expect(r.join('')).toBe(sampleWords.join(',') + ',');

        const r2 = [...bufferLines(bufferLines(concat(sampleWords, sampleWords.concat().reverse()), 1, ','), 10, '')];
        expect(r2.join('')).toBe(sampleWords.join(',') + ',' + sampleWords.concat().reverse().join(',') + ',');
    });
});

function* concat<T>(a: Iterable<T>, b: Iterable<T>) {
    yield* a;
    yield* b;
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
