import { findWord, PartialFindOptions, FindResult } from './find';
import { parseDictionary } from './SimpleDictionaryParser';
import { Trie } from './trie';

describe('Validate findWord', () => {
    const trie = dictionary().root;

    test('test find exact words preserve case', () => {
        // Code is not allowed as a full word.
        expect(findWord(trie, 'blueerror', { matchCase: true, compoundMode: 'none' }))
        .toEqual({ found: 'blueerror', compoundUsed: false, forbidden: true });

        expect(findWord(trie, 'code', { matchCase: true, compoundMode: 'none' }))
        .toEqual({ found: 'code', compoundUsed: false, forbidden: false });

        expect(findWord(trie, 'code', { matchCase: true, compoundMode: 'compound' }))
        .toEqual({ found: 'code', compoundUsed: false, forbidden: false });
    });

    const tests: [string, PartialFindOptions, FindResult][] = [
        ['Code', { matchCase: true,  compoundMode: 'none' }, frNotFound()],
        ['code', { matchCase: true,  compoundMode: 'none' }, frFound('code')],
        ['cafe', { matchCase: true,  compoundMode: 'none' }, frNotFound()],
        ['cafe', { matchCase: false, compoundMode: 'none' }, frFound('cafe')],

        // Compounding enabled, but matching whole words (compounding not used).
        ['Code', { matchCase: true,  compoundMode: 'compound' }, frFound(false)],
        ['code', { matchCase: true,  compoundMode: 'compound' }, frFound('code')],
        ['cafe', { matchCase: true,  compoundMode: 'compound' }, frFound(false)],
        ['cafe', { matchCase: false, compoundMode: 'compound' }, frFound('cafe')],

        ['errorCodes', { matchCase: true,  compoundMode: 'compound' }, frCompoundFound('errorCodes')],
        ['errorsCodes', { matchCase: true,  compoundMode: 'compound' }, frCompoundFound(false)],
        ['errorsCodes', { matchCase: true,  compoundMode: 'compound' }, frCompoundFound(false)],
        ['codeErrors', { matchCase: true,  compoundMode: 'compound' }, frCompoundFound('codeErrors')],
        ['codeCodeCodeCodeError', { matchCase: true,  compoundMode: 'compound' }, frCompoundFound('codeCodeCodeCodeError')],
    ];

    tests.forEach(function ([word, options, exResult]) {
        test(`Find Word: ${word} ${JSON.stringify(options)}, ${JSON.stringify(exResult)}`, () => {
            expect(findWord(trie, word, options)).toEqual(exResult);
        });
     } );

});

function frNotFound(compoundUsed: boolean = false): FindResult {
    return {
        found: false,
        forbidden: false,
        compoundUsed,
    };
}

function frFound(found: string | false, forbidden: boolean = false, compoundUsed: boolean = false): FindResult {
    return {
        found,
        forbidden,
        compoundUsed,
    };
}

function frCompoundFound(found: string | false, forbidden: boolean = false, compoundUsed: boolean = true): FindResult {
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
        msg*
        blue*
        !blueerror
    `);
}
