import { describe, expect, test } from 'vitest';

import { parseDictionaryLegacy } from '../SimpleDictionaryParser.js';
import { FastTrieBlobBuilder } from '../TrieBlob/FastTrieBlobBuilder.js';
import type { TrieData } from '../TrieData.js';
import type { TrieRoot } from '../TrieNode/TrieNode.js';
import { TrieNodeTrie } from '../TrieNode/TrieNodeTrie.js';
import { __testing__, createFindOptions, findLegacyCompound, findWord } from './find.js';
import type { PartialFindOptions } from './FindOptions.js';
import type { FindFullResult } from './ITrieNode.js';

const findLegacyCompoundWord = __testing__.findLegacyCompoundWord;

describe('Validate findWord', () => {
    const trie = dictionaryTrieNodeTrie().getRoot();
    const trieBlob = dictionaryTrieBlob().getRoot();

    const cModeC = { compoundMode: 'compound' };
    const mCaseT = { matchCase: true };
    const mCaseF = { matchCase: false };
    const ckForbidT = { checkForbidden: true };
    const cSep = { compoundSeparator: '|' };

    // cspell:ignore bluemsg
    test.each`
        word           | opts                                              | expected
        ${'blueerror'} | ${{ matchCase: true, compoundMode: 'none' }}      | ${{ found: false, compoundUsed: false, forbidden: true, caseMatched: true }}
        ${'blueerror'} | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: false, compoundUsed: true, forbidden: undefined, caseMatched: true }}
        ${'blueCode'}  | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: 'blueCode', compoundUsed: true, forbidden: true, caseMatched: true }}
        ${'bluecode'}  | ${{ matchCase: false, compoundMode: 'compound' }} | ${{ found: 'bluecode', compoundUsed: true, forbidden: true, caseMatched: false }}
        ${'bluemsg'}   | ${{ matchCase: false, compoundMode: 'compound' }} | ${{ found: 'bluemsg', compoundUsed: true, forbidden: false, caseMatched: true }}
        ${'code'}      | ${{ matchCase: true, compoundMode: 'none' }}      | ${{ found: 'code', compoundUsed: false, forbidden: false, caseMatched: true }}
        ${'code'}      | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: 'code', compoundUsed: false, forbidden: undefined, caseMatched: true }}
        ${'apple'}     | ${{ ...mCaseT, ...cModeC }}                       | ${{ found: 'apple', compoundUsed: false, forbidden: undefined, caseMatched: true }}
        ${'apple'}     | ${{ ...mCaseT, ...cModeC, ...ckForbidT }}         | ${{ found: 'apple', compoundUsed: false, forbidden: true, caseMatched: true }}
        ${'bluecode'}  | ${{ ...cModeC, ...mCaseF, ...cSep }}              | ${{ found: 'blue|code', compoundUsed: true, forbidden: true, caseMatched: false }}
    `('find exact words preserve case "$word" $opts', ({ word, opts, expected }) => {
        // Code is not allowed as a full word.
        expect(findWord(trie, word, opts)).toEqual(expected);
    });

    test.each`
        word           | opts                                              | expected
        ${'blueerror'} | ${{ matchCase: true, compoundMode: 'none' }}      | ${{ found: false, compoundUsed: false, forbidden: true, caseMatched: true }}
        ${'blueerror'} | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: false, compoundUsed: true, forbidden: undefined, caseMatched: true }}
        ${'blueCode'}  | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: 'blueCode', compoundUsed: true, forbidden: true, caseMatched: true }}
        ${'bluecode'}  | ${{ ...mCaseF, ...cModeC }}                       | ${{ found: 'bluecode', compoundUsed: true, forbidden: true, caseMatched: false }}
        ${'bluemsg'}   | ${{ matchCase: false, compoundMode: 'compound' }} | ${{ found: 'bluemsg', compoundUsed: true, forbidden: false, caseMatched: true }}
        ${'code'}      | ${{ matchCase: true, compoundMode: 'none' }}      | ${{ found: 'code', compoundUsed: false, forbidden: false, caseMatched: true }}
        ${'code'}      | ${{ matchCase: true, compoundMode: 'compound' }}  | ${{ found: 'code', compoundUsed: false, forbidden: undefined, caseMatched: true }}
        ${'apple'}     | ${{ ...mCaseT, ...cModeC }}                       | ${{ found: 'apple', compoundUsed: false, forbidden: undefined, caseMatched: true }}
        ${'apple'}     | ${{ ...mCaseT, ...cModeC, ...ckForbidT }}         | ${{ found: 'apple', compoundUsed: false, forbidden: true, caseMatched: true }}
        ${'bluecode'}  | ${{ ...cModeC, ...mCaseF, ...cSep }}              | ${{ found: 'blue|code', compoundUsed: true, forbidden: true, caseMatched: false }}
    `('find exact words preserve case "$word" $opts', ({ word, opts, expected }) => {
        // Code is not allowed as a full word.
        expect(findWord(trieBlob, word, opts)).toEqual(expected);
    });

    const ncf = { checkForbidden: false };

    const tests: [string, PartialFindOptions, FindFullResult][] = [
        [
            'errorCodes',
            { matchCase: false, compoundMode: 'compound', checkForbidden: true },
            frCompoundFound('errorCodes', { forbidden: false }),
        ],
        [
            'errorCodes',
            { matchCase: false, compoundMode: 'compound', checkForbidden: false },
            frCompoundFound('errorCodes', { forbidden: undefined }),
        ],
        [
            'errorcodes',
            { matchCase: false, compoundMode: 'compound' },
            frCompoundFound('errorcodes', { forbidden: false, caseMatched: false }),
        ],
        ['Code', { matchCase: true, compoundMode: 'none' }, frNotFound({ forbidden: false })],
        ['code', { matchCase: true, compoundMode: 'none' }, frFound('code', { forbidden: false })],
        ['cafe', { matchCase: true, compoundMode: 'none' }, frNotFound({ forbidden: false })],
        ['café', { matchCase: true, compoundMode: 'none' }, frFound('café', { forbidden: false })],

        // Do not check forbidden words.
        ['Code', { matchCase: true, compoundMode: 'none', ...ncf }, frNotFound()],
        ['code', { matchCase: true, compoundMode: 'none', ...ncf }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'none', ...ncf }, frNotFound()],
        ['café', { matchCase: true, compoundMode: 'none', ...ncf }, frFound('café')],

        // non-normalized words
        ['café', { matchCase: false, compoundMode: 'none' }, frFound('café')],
        ['Café', { matchCase: false, compoundMode: 'none' }, frNotFound()],
        ['cafe', { matchCase: false, compoundMode: 'none' }, frFound('cafe', { caseMatched: false })],
        ['Code', { matchCase: false, compoundMode: 'none' }, frNotFound()],

        // It will find the special characters. Might not be desired.
        ['code+', { matchCase: true, compoundMode: 'none' }, frFound('code+', { forbidden: false })],
        ['+Code+', { matchCase: true, compoundMode: 'none' }, frFound('+Code+', { forbidden: false })],
        ['code+', { matchCase: true, compoundMode: 'none' }, frFound('code+', { forbidden: false })],
        ['~+code+', { matchCase: true, compoundMode: 'none' }, frFound('~+code+', { forbidden: false })],

        // Compounding enabled, but matching whole words (compounding not used).
        ['Code', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['code', { matchCase: true, compoundMode: 'compound' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'compound' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'compound' }, frFound('cafe', { caseMatched: false })],

        [
            'errorCodes',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('errorCodes', { forbidden: false }),
        ],
        [
            'errorCodes',
            { matchCase: false, compoundMode: 'compound' },
            frCompoundFound('errorCodes', { forbidden: false }),
        ],
        ['errorsCodes', { matchCase: true, compoundMode: 'compound' }, frCompoundFound(false)],
        ['errorsCodes', { matchCase: true, compoundMode: 'compound' }, frCompoundFound(false)],
        [
            'codeErrors',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('codeErrors', { forbidden: false }),
        ],
        [
            'codeCodeCodeCodeError',
            { matchCase: true, compoundMode: 'compound' },
            frCompoundFound('codeCodeCodeCodeError', { forbidden: false }),
        ],

        // Legacy compounding
        // cspell:ignore codeerrors errmsg errmsgerr
        ['Code', { matchCase: true, compoundMode: 'legacy' }, frFound(false)],
        ['code', { matchCase: true, compoundMode: 'legacy' }, frFound('code')],
        ['cafe', { matchCase: true, compoundMode: 'legacy' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'legacy' }, frFound('cafe', { caseMatched: false })],
        ['codeErrors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound(false)],
        ['errmsg', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('err+msg')],
        ['errmsgerr', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('err+msg+err')],
        ['code+Errors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('code++Errors')],
        ['codeerrors', { matchCase: true, compoundMode: 'legacy' }, frCompoundFound('code+errors')],
    ];

    test.each(tests)('%s %j %j', (word, options, exResult) => {
        expect(findWord(trie, word, options)).toEqual(oc(exResult));
    });
});

describe('Validate Legacy Compound lookup', () => {
    // cspell:ignore talkinglift joywalk jwalk awalk jayjay jayi
    // cspell:ignore walkin walkjay walkedge
    test.each`
        word             | compoundLen | expected
        ${'talkinglift'} | ${true}     | ${'talking+lift'}
        ${'joywalk'}     | ${true}     | ${'joy+walk'}
        ${'jaywalk'}     | ${true}     | ${'jay+walk'}
        ${'jwalk'}       | ${true}     | ${false}
        ${'awalk'}       | ${true}     | ${false}
        ${'jayjay'}      | ${true}     | ${'jay+jay'}
        ${'jayjay'}      | ${4}        | ${false}
        ${'jayi'}        | ${3}        | ${false}
        ${'toto'}        | ${true}     | ${false}
        ${'toto'}        | ${2}        | ${'to+to'}
        ${'toto'}        | ${1}        | ${'to+to'}
        ${'iif'}         | ${1}        | ${'iif'}
        ${'uplift'}      | ${true}     | ${false}
        ${'endless'}     | ${true}     | ${'end+less'}
        ${'joywalk'}     | ${999}      | ${false}
        ${'walked'}      | ${true}     | ${'walked'}
        ${'walkin'}      | ${true}     | ${false}
        ${'walkup'}      | ${true}     | ${false}
        ${'walkjay'}     | ${true}     | ${'walk+jay'}
        ${'walkjay'}     | ${4}        | ${false}
        ${'walkedge'}    | ${4}        | ${'walk+edge'}
    `('compound words no case "$word" compoundLen: $compoundLen', ({ word, compoundLen, expected }) => {
        const trie = TrieNodeTrie.createFromWords(sampleWords);
        function find(word: string, compoundLen: true | number) {
            const len = compoundLen === true ? 3 : compoundLen;
            return findLegacyCompoundWord([trie.getRoot()], word, len, '+').found;
        }
        expect(find(word, compoundLen)).toBe(expected);
    });

    // cspell:ignore cafecode codecafe
    test.each`
        word            | compoundLen | expected
        ${'codecafe'}   | ${true}     | ${true}
        ${'codeerrors'} | ${true}     | ${true}
        ${'cafecode'}   | ${true}     | ${true}
    `('compound words "$word" compoundLen: $compoundLen', ({ word, compoundLen, expected }) => {
        const trie = dictionaryTrieNodeTrie();
        function has(word: string, minLegacyCompoundLength: true | number): boolean {
            const len = minLegacyCompoundLength !== true ? minLegacyCompoundLength : 3;
            const findOptions = createFindOptions({ legacyMinCompoundLength: len });
            return !!findLegacyCompound(trie.getRoot(), word, findOptions).found;
        }
        expect(has(word, compoundLen)).toBe(expected);
    });
});

type PartialFindFullResult = Partial<FindFullResult>;

function fr(r: PartialFindFullResult): FindFullResult {
    const { found = false, forbidden = undefined, compoundUsed = false, caseMatched = true } = r;
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

// cspell:ignore blueerror bluecode
function dictionaryTrieRoot(): TrieRoot {
    // camel case dictionary
    const trie = parseDictionaryLegacy(`
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
        ~!bluecode
        !blueCode
        apple
        !apple
    `);
    return trie.root;
}

function dictionaryTrieNodeTrie(): TrieData {
    return new TrieNodeTrie(dictionaryTrieRoot());
}

function dictionaryTrieBlob(): TrieData {
    const ft = FastTrieBlobBuilder.fromTrieRoot(dictionaryTrieRoot());
    return ft.toTrieBlob();
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

function oc(t: unknown) {
    return expect.objectContaining(t);
}
