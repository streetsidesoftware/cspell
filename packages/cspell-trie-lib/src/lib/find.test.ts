import {
    createFindOptions,
    FindFullResult,
    findLegacyCompound,
    findWord,
    PartialFindOptions,
    __testing__,
} from './find';
import { parseDictionary } from './SimpleDictionaryParser';
import { Trie } from './trie';

const findLegacyCompoundWord = __testing__.findLegacyCompoundWord;

describe('Validate findWord', () => {
    const trie = dictionary().root;

    test('find exact words preserve case', () => {
        // Code is not allowed as a full word.
        expect(
            findWord(trie, 'blueerror', {
                matchCase: true,
                compoundMode: 'none',
            })
        ).toEqual({ found: 'blueerror', compoundUsed: false, forbidden: true, caseMatched: true });

        expect(findWord(trie, 'code', { matchCase: true, compoundMode: 'none' })).toEqual({
            found: 'code',
            compoundUsed: false,
            forbidden: false,
            caseMatched: true,
        });

        expect(
            findWord(trie, 'code', {
                matchCase: true,
                compoundMode: 'compound',
            })
        ).toEqual(expect.objectContaining({ found: 'code', compoundUsed: false, forbidden: false, caseMatched: true }));
    });

    const tests: [string, PartialFindOptions, FindFullResult][] = [
        ['errorCodes', { matchCase: false, compoundMode: 'compound' }, frCompoundFound('errorCodes')],
        ['errorcodes', { matchCase: false, compoundMode: 'compound' }, frCompoundFound('errorcodes')],
        ['Code', { matchCase: true, compoundMode: 'none' }, frNotFound()],
        ['code', { matchCase: true, compoundMode: 'none' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'none' }, frNotFound()],
        ['café', { matchCase: true, compoundMode: 'none' }, frFound('café')],

        // non-normalized words
        ['café', { matchCase: false, compoundMode: 'none' }, frFound('café')],
        ['Café', { matchCase: false, compoundMode: 'none' }, frNotFound()],
        ['cafe', { matchCase: false, compoundMode: 'none' }, frFound('cafe', { caseMatched: false })],
        ['Code', { matchCase: false, compoundMode: 'none' }, frNotFound()],

        // It will find the special characters. Might not be desired.
        ['code+', { matchCase: true, compoundMode: 'none' }, frFound('code+')],
        ['+Code+', { matchCase: true, compoundMode: 'none' }, frFound('+Code+')],
        ['code+', { matchCase: true, compoundMode: 'none' }, frFound('code+')],
        ['~+code+', { matchCase: true, compoundMode: 'none' }, frFound('~+code+')],

        // Compounding enabled, but matching whole words (compounding not used).
        ['Code', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['code', { matchCase: true, compoundMode: 'compound' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'compound' }, frFound('cafe', { caseMatched: false })],

        ['errorCodes', { matchCase: true, compoundMode: 'compound' }, frCompoundFound('errorCodes')],
        ['errorCodes', { matchCase: false, compoundMode: 'compound' }, frCompoundFound('errorCodes')],
        ['errorsCodes', { matchCase: true, compoundMode: 'compound' }, frCompoundFound(false)],
        ['errorsCodes', { matchCase: true, compoundMode: 'compound' }, frCompoundFound(false)],
        ['codeErrors', { matchCase: true, compoundMode: 'compound' }, frCompoundFound('codeErrors')],
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
        ['cafe', { matchCase: false, compoundMode: 'legacy' }, frFound('cafe', { caseMatched: false })],
        ['codeErrors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound(false)],
        ['errmsg', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('errmsg')],
        ['errmsgerr', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('errmsgerr')],
        ['code+Errors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('code+Errors')],
        ['codeerrors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('codeerrors')],
    ];

    test.each(tests)('%s %j %j', (word, options, exResult) => {
        expect(findWord(trie, word, options)).toEqual(expect.objectContaining(exResult));
    });
});

describe('Validate Legacy Compound lookup', () => {
    // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
    // cspell:ignore walkin walkjay walkedge
    test.each`
        word             | compoundLen | expected
        ${'talkinglift'} | ${true}     | ${true}
        ${'joywalk'}     | ${true}     | ${true}
        ${'jaywalk'}     | ${true}     | ${true}
        ${'jwalk'}       | ${true}     | ${false}
        ${'awalk'}       | ${true}     | ${false}
        ${'jayjay'}      | ${true}     | ${true}
        ${'jayjay'}      | ${4}        | ${false}
        ${'jayi'}        | ${3}        | ${false}
        ${'toto'}        | ${true}     | ${false}
        ${'toto'}        | ${2}        | ${true}
        ${'toto'}        | ${1}        | ${true}
        ${'iif'}         | ${1}        | ${true}
        ${'uplift'}      | ${true}     | ${false}
        ${'endless'}     | ${true}     | ${true}
        ${'joywalk'}     | ${999}      | ${false}
        ${'walked'}      | ${true}     | ${true}
        ${'walkin'}      | ${true}     | ${false}
        ${'walkup'}      | ${true}     | ${false}
        ${'walkjay'}     | ${true}     | ${true}
        ${'walkjay'}     | ${4}        | ${false}
        ${'walkedge'}    | ${4}        | ${true}
    `('compound words no case "$word" compoundLen: $compoundLen', ({ word, compoundLen, expected }) => {
        const trie = Trie.create(sampleWords);
        function has(word: string, compoundLen: true | number): boolean {
            const len = compoundLen === true ? 3 : compoundLen;
            return !!findLegacyCompoundWord([trie.root], word, len).found;
        }
        expect(has(word, compoundLen)).toBe(expected);
    });

    // cspell:ignore cafecode codecafe
    test.each`
        word            | compoundLen | expected
        ${'codecafe'}   | ${true}     | ${true}
        ${'codeerrors'} | ${true}     | ${true}
        ${'cafecode'}   | ${true}     | ${true}
    `('compound words "$word" compoundLen: $compoundLen', ({ word, compoundLen, expected }) => {
        const trie = dictionary();
        function has(word: string, minLegacyCompoundLength: true | number): boolean {
            const len = minLegacyCompoundLength !== true ? minLegacyCompoundLength : 3;
            const findOptions = createFindOptions({ legacyMinCompoundLength: len });
            return !!findLegacyCompound(trie.root, word, findOptions).found;
        }
        expect(has(word, compoundLen)).toBe(expected);
    });
});

type PartialFindFullResult = Partial<FindFullResult>;

function fr({
    found = false,
    forbidden = false,
    compoundUsed = false,
    caseMatched = true,
}: PartialFindFullResult): FindFullResult {
    return {
        found,
        forbidden,
        compoundUsed,
        caseMatched,
    };
}

function frNotFound(r: PartialFindFullResult = {}): FindFullResult {
    const { found = false } = r;
    return fr({ ...r, found });
}

function frFound(found: string | false, r: PartialFindFullResult = {}): FindFullResult {
    return fr({
        ...r,
        found,
    });
}

function frCompoundFound(found: string | false, r: PartialFindFullResult = {}): FindFullResult {
    const { compoundUsed = true } = r;
    return frFound(found, { ...r, compoundUsed });
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
