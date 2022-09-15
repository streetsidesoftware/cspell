import {
    regExAccents,
    regExAllLower,
    regExAllUpper,
    regExDanglingQuote,
    regExFirstUpper,
    regExMatchRegExParts,
    regExSplitWords,
    regExSplitWords2,
    regExTrailingEndings,
    stringToRegExp,
} from './textRegex';

describe('Validate textRegex', () => {
    // cspell:ignore CODE'ing
    test.each`
        text              | expected
        ${'hello'}        | ${[]}
        ${'CODEing'}      | ${[['ing']]}
        ${"CODE'ing"}     | ${[["'ing"]]}
        ${"ERROR'd"}      | ${[["'d"]]}
        ${"ERROR's"}      | ${[["'s"]]}
        ${'ERRORs'}       | ${[['s']]}
        ${'ERRORes'}      | ${[['es']]}
        ${'ERRORth'}      | ${[['th']]}
        ${'ERRORnth'}     | ${[['nth']]}
        ${'ERRORies'}     | ${[['ies']]}
        ${nfc('CAFÉed')}  | ${[['ed']]}
        ${nfd('CAFÉed')}  | ${[['ed']]}
        ${nfd('CAFÉ’ed')} | ${[['’ed']]}
        ${nfd('CAFÉ’s')}  | ${[['’s']]}
    `('regExTrailingEndings on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = [...text.matchAll(regExTrailingEndings)].map((m) => Array.from(m));
        expect(m).toEqual(expected);
    });

    // cspell:word é
    test.each`
        text              | expected
        ${'hello'}        | ${[]}
        ${"ERROR's"}      | ${[]}
        ${"'thing"}       | ${["'"]}
        ${"n'cpp"}        | ${["'"]}
        ${"s'thing"}      | ${["'"]}
        ${"A'thing"}      | ${["'"]}
        ${"s 'thing"}     | ${["'"]}
        ${nfc(`é'thing`)} | ${["'"]}
        ${nfd(`é'thing`)} | ${["'"]}
    `('regExDanglingQuote on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = text.match(regExDanglingQuote) ?? [];
        expect([...m]).toEqual(expected);
    });

    test.each`
        text              | expected
        ${'hello'}        | ${[]}
        ${"ERROR's"}      | ${[]}
        ${nfc(`é'thing`)} | ${[]}
        ${nfd(`é'thing`)} | ${[nfd('á').replace('a', '')]}
    `('regExAccents on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = text.match(regExAccents) ?? [];
        expect([...m]).toEqual(expected);
    });

    // cspell:word érror
    test.each`
        text                          | expected
        ${'hello'}                    | ${[]}
        ${'ERROR'}                    | ${['ERROR']}
        ${'ERRORs'}                   | ${[]}
        ${nfc(`érror`).toUpperCase()} | ${[nfc('ÉRROR')]}
        ${nfd(`érror`).toUpperCase()} | ${[nfd('ÉRROR')]}
    `('regExAllUpper on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = text.match(regExAllUpper) ?? [];
        expect([...m]).toEqual(expected);
    });

    test.each`
        text            | expected
        ${'hello'}      | ${['hello']}
        ${'ERROR'}      | ${[]}
        ${'Errors'}     | ${[]}
        ${nfc(`érror`)} | ${[nfc('érror')]}
        ${nfd(`érror`)} | ${[nfd('érror')]}
        ${nfc(`érror`)} | ${[nfc('érror')]}
        ${nfc(`café`)}  | ${[nfc('café')]}
        ${nfd(`café`)}  | ${[nfd('café')]}
    `('regExAllLower on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = text.match(regExAllLower) ?? [];
        expect([...m]).toEqual(expected);
    });

    test.each`
        text            | expected
        ${'hello'}      | ${[]}
        ${'ERROR'}      | ${[]}
        ${'Errors'}     | ${['Errors']}
        ${nfc(`Érror`)} | ${[nfc('Érror')]}
        ${nfd(`Érror`)} | ${[nfd('Érror')]}
    `('regExFirstUpper on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = text.match(regExFirstUpper) ?? [];
        expect([...m]).toEqual(expected);
    });

    test.each`
        text                | expected
        ${'hello'}          | ${[]}
        ${'errorCode'}      | ${[['rC', 'r', 'C']]}
        ${nfc('caféStyle')} | ${[[nfc('éS'), nfc('é'), 'S']]}
        ${nfd('caféStyle')} | ${[[nfd('éS'), nfd('é'), 'S']]}
        ${'Errors'}         | ${[]}
    `('regExSplitWords on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = [...text.matchAll(regExSplitWords)].map((m) => Array.from(m));
        expect(m).toEqual(expected);
    });

    test.each`
        text                | expected
        ${'hello'}          | ${[]}
        ${'ERRORCode'}      | ${[['RCo', 'R', 'Co']]}
        ${nfc('CAFÉStyle')} | ${[[nfc('ÉSt'), nfc('É'), 'St']]}
        ${nfd('CAFÉStyle')} | ${[[nfd('ÉSt'), nfd('É'), 'St']]}
        ${nfc('CODEÉrror')} | ${[[nfc('EÉr'), 'E', nfc('Ér')]]}
        ${nfd('CODEÉrror')} | ${[[nfd('EÉr'), 'E', nfd('Ér')]]}
        ${'ERRORS'}         | ${[]}
    `('regExSplitWords2 on "$text"', ({ text, expected }: { text: string; expected: string[] }) => {
        const m = [...text.matchAll(regExSplitWords2)].map((m) => Array.from(m));
        expect(m).toEqual(expected);
    });

    test.each`
        value           | expected
        ${''}           | ${null}
        ${'/pat/gm'}    | ${['/pat/gm', 'pat', 'gm']}
        ${' /pat/gm\n'} | ${[' /pat/gm\n', 'pat', 'gm']}
    `('regExMatchRegExParts "$value"', ({ value, expected }) => {
        const r = value.match(regExMatchRegExParts);
        expect(r ? [...r] : r).toEqual(expected);
    });

    const examplePattern = `/
    ^                           # start of url
    https?:\\/\\/([^?#\n]*?)    # path
    (\\?[^#\n]*?)?              # query
    (\\#.*?)?                   # hash
    $                           # end of string
    /gmx`;

    test.each`
        pattern                            | expected
        ${''}                              | ${undefined}
        ${'/pat/gm'}                       | ${/pat/gm}
        ${' /pat/gm\n'}                    | ${/pat/gm}
        ${' /\npat # the pattern\n/gmx\n'} | ${/pat/gm}
        ${' /\npat # the pattern\n/gm\n'}  | ${/\npat # the pattern\n/gm}
        ${examplePattern}                  | ${/^https?:\/\/([^?#\n]*?)(\?[^#\n]*?)?(#.*?)?$/gm}
    `('stringToRegExp "$pattern"', ({ pattern, expected }) => {
        const r = stringToRegExp(pattern);
        expect(r).toEqual(expected);
    });
});

// function s(t: string, on: string | RegExp = '|'): string[] {
//     return t.split(on);
// }

function nfc(s: string): string {
    return s.normalize('NFC');
}

function nfd(s: string): string {
    return s.normalize('NFD');
}
