import {
    findWord,
    PartialFindOptions,
    FindFullResult,
    findLegacyCompoundWord,
} from './find';
import { parseDictionary } from './SimpleDictionaryParser';
import { Trie } from './trie';

describe('Validate findWord', () => {
    const trie = dictionary().root;

    test('test find exact words preserve case', () => {
        // Code is not allowed as a full word.
        expect(
            findWord(trie, 'blueerror', {
                matchCase: true,
                compoundMode: 'none',
            })
        ).toEqual({ found: 'blueerror', compoundUsed: false, forbidden: true });

        expect(
            findWord(trie, 'code', { matchCase: true, compoundMode: 'none' })
        ).toEqual({ found: 'code', compoundUsed: false, forbidden: false });

        expect(
            findWord(trie, 'code', {
                matchCase: true,
                compoundMode: 'compound',
            })
        ).toEqual({ found: 'code', compoundUsed: false, forbidden: false });
    });

    const tests: [string, PartialFindOptions, FindFullResult][] = [
        ['Code', { matchCase: true, compoundMode: 'none' }, frNotFound()],
        ['code', { matchCase: true, compoundMode: 'none' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'none' }, frNotFound()],
        ['café', { matchCase: true, compoundMode: 'none' }, frFound('café')],

        // non-normalized words
        ['café', { matchCase: false, compoundMode: 'none' }, frNotFound()],
        ['cafe', { matchCase: false, compoundMode: 'none' }, frFound('cafe')],
        ['Code', { matchCase: false, compoundMode: 'none' }, frNotFound()],

        // It will find the special characters. Might not be desired.
        ['code+', { matchCase: true, compoundMode: 'none' }, frFound('code+')],
        [
            '+Code+',
            { matchCase: true, compoundMode: 'none' },
            frFound('+Code+'),
        ],
        [
            '~code+',
            { matchCase: true, compoundMode: 'none' },
            frFound('~code+'),
        ],
        [
            '~+code+',
            { matchCase: true, compoundMode: 'none' },
            frFound('~+code+'),
        ],

        // Compounding enabled, but matching whole words (compounding not used).
        ['Code', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        [
            'code',
            { matchCase: true, compoundMode: 'compound' },
            frFound('code'),
        ],
        ['cafe', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        [
            'cafe',
            { matchCase: false, compoundMode: 'compound' },
            frFound('cafe'),
        ],

        [
            'errorCodes',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('errorCodes'),
        ],
        [
            'errorsCodes',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound(false),
        ],
        [
            'errorsCodes',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound(false),
        ],
        [
            'codeErrors',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('codeErrors'),
        ],
        [
            'codeCodeCodeCodeError',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('codeCodeCodeCodeError'),
        ],

        // Legacy compounding
        // cspell:ignore codeerrors errmsg errmsgerr
        ['Code', { matchCase: true, compoundMode: 'legacy' }, frFound(false)],
        ['code', { matchCase: true, compoundMode: 'legacy' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'legacy' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'legacy' }, frFound('cafe')],
        [
            'codeErrors',
            { matchCase: true, compoundMode: 'legacy' },
            frCompoundFound(false),
        ],
        [
            'errmsg',
            { matchCase: true, compoundMode: 'legacy' },
            frCompoundFound('errmsg'),
        ],
        [
            'errmsgerr',
            { matchCase: true, compoundMode: 'legacy' },
            frCompoundFound('errmsgerr'),
        ],
        [
            'code+Errors',
            { matchCase: true, compoundMode: 'legacy' },
            frCompoundFound('code+Errors'),
        ],
        [
            'codeerrors',
            { matchCase: true, compoundMode: 'legacy' },
            frCompoundFound('codeerrors'),
        ],
    ];

    tests.forEach(function ([word, options, exResult]) {
        test(`Find Word: ${word} ${JSON.stringify(options)}, ${JSON.stringify(exResult)}`, () => {
            expect(findWord(trie, word, options)).toEqual(exResult);
        });
    });
});

describe('Validate Legacy Compound lookup', () => {
    test('Test compound words', () => {
        // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
        const trie = Trie.create(sampleWords);
        function has(word: string, compoundLen: true | number): boolean {
            const len = compoundLen === true ? 3 : compoundLen;
            return !!findLegacyCompoundWord(trie.root, word, len).found;
        }
        expect(has('talkinglift', true)).toBe(true);
        expect(has('joywalk', true)).toBe(true);
        expect(has('jaywalk', true)).toBe(true);
        expect(has('jwalk', true)).toBe(false);
        expect(has('awalk', true)).toBe(false);
        expect(has('jayjay', true)).toBe(true);
        expect(has('jayjay', 4)).toBe(false);
        expect(has('jayi', 3)).toBe(false);
        expect(has('toto', true)).toBe(false);
        expect(has('toto', 2)).toBe(true);
        expect(has('toto', 1)).toBe(true);
        expect(has('iif', 1)).toBe(true);
        expect(has('uplift', true)).toBe(false);
        expect(has('endless', true)).toBe(true);
        expect(has('joywalk', 999)).toBe(false);
        expect(has('walked', true)).toBe(true);
        expect(has('walkin', true)).toBe(false); // cspell:disable-line
        expect(has('walkup', true)).toBe(false); // cspell:disable-line
        expect(has('walkjay', true)).toBe(true); // cspell:disable-line
        expect(has('walkjay', 4)).toBe(false); // cspell:disable-line
        expect(has('walkedge', 4)).toBe(true); // cspell:disable-line
    });
});

function frNotFound(compoundUsed = false): FindFullResult {
    return {
        found: false,
        forbidden: false,
        compoundUsed,
    };
}

function frFound(
    found: string | false,
    forbidden = false,
    compoundUsed = false
): FindFullResult {
    return {
        found,
        forbidden,
        compoundUsed,
    };
}

function frCompoundFound(
    found: string | false,
    forbidden = false,
    compoundUsed = true
): FindFullResult {
    return frFound(found, forbidden, compoundUsed);
}

// cspell:ignore blueerror
function dictionary(): Trie {
    // camel case dictionary
    return parseDictionary(`
        café*
        +Code*
        +Codes
        code*
        codes
        +Error*
        +Errors
        error*
        errors
        err*
        +Message*
        message*
        *msg*
        blue*
        !blueerror
    `);
}

const sampleWords = [
    'a',
    'i',
    'an',
    'as',
    'at',
    'be',
    'bi',
    'by',
    'do',
    'eh',
    'go',
    'he',
    'hi',
    'if',
    'in',
    'is',
    'it',
    'me',
    'my',
    'oh',
    'ok',
    'on',
    'so',
    'to',
    'uh',
    'um',
    'up',
    'us',
    'we',
    'edit',
    'end',
    'edge',
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
    'less',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'jay',
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
