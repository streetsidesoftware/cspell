import { mapRawString } from './typescript';

describe('mappers typescript', () => {
    // cspell:ignore Fingerspitzengef Fingerspitzengefühl ˈfɪŋɐˌʃpɪtsənɡəˌfyːl
    const sample = {
        text: 'Fingerspitzengefühl is a German term.\nIt’s pronounced as follows: [ˈfɪŋɐˌʃpɪtsənɡəˌfyːl]',
        hex: '\\x46\\x69\\x6E\\x67\\x65\\x72\\x73\\x70\\x69\\x74\\x7A\\x65\\x6E\\x67\\x65\\x66\\xFC\\x68\\x6C\\x20\\x69\\x73\\x20\
\\x61\\x20\\x47\\x65\\x72\\x6D\\x61\\x6E\\x20\\x74\\x65\\x72\\x6D\\x2E\n\\x49\\x74\\u2019\\x73\\x20\\x70\\x72\\x6F\\x6E\\x6F\\x75\\x6E\
\\x63\\x65\\x64\\x20\\x61\\x73\\x20\\x66\\x6F\\x6C\\x6C\\x6F\\x77\\x73\\x3A\\x20\\x5B\\u02C8\\x66\\u026A\\u014B\\u0250\\u02CC\\u0283\
\\x70\\u026A\\x74\\x73\\u0259\\x6E\\u0261\\u0259\\u02CC\\x66\\x79\\u02D0\\x6C\\x5D',
        mixed: 'Fingerspitzengef\\xFChl is a German term.\nIt\\u2019s pronounced as follows: \
[\\u02C8f\\u026A\\u014B\\u0250\\u02CC\\u0283p\\u026Ats\\u0259n\\u0261\\u0259\\u02CCfy\\u02D0l]',
    };

    const emojis = {
        text: 'Emojis 😁🥳🙈🙉🙊',
        unicode: 'Emojis \\uD83D\\uDE01\\uD83E\\uDD73\\uD83D\\uDE48\\uD83D\\uDE49\\uD83D\\uDE4A',
        codePoint: 'Emojis \\u{1F601}\\u{1F973}\\u{1F648}\\u{1F649}\\u{1F64A}',
    };

    test.each`
        text                    | expected
        ${''}                   | ${''}
        ${'hello'}              | ${'hello'}
        ${'caf\\xe9'}           | ${'café'}
        ${'caf\\u00e9'}         | ${'café'}
        ${'hello\\x20there'}    | ${'hello\x20there'}
        ${'hello\\u0020there'}  | ${'hello\u0020there'}
        ${'hello\\u{020}there'} | ${'hello\u{020}there'}
        ${'a\\tb'}              | ${'a\tb'}
        ${'a\\rb'}              | ${'a\rb'}
        ${'a\\nb'}              | ${'a\nb'}
        ${'a\\dd'}              | ${'add'}
        ${'a\\x'}               | ${'ax'}
        ${'a\\xy'}              | ${'axy'}
        ${'a\\x9h'}             | ${'ax9h'}
        ${'a\\u9h'}             | ${'au9h'}
        ${'a\\u{9h}'}           | ${'au{9h}'}
        ${sample.text}          | ${sample.text}
        ${sample.hex}           | ${sample.text}
        ${sample.mixed}         | ${sample.text}
        ${emojis.text}          | ${emojis.text}
        ${emojis.unicode}       | ${emojis.text}
        ${emojis.codePoint}     | ${emojis.text}
    `('mapRawString $# [$text]', ({ text, expected }) => {
        const r = mapRawString(text);
        expect(toCharCodes(r.text)).toBe(toCharCodes(expected));
        expect(r.text).toBe(expected);
    });

    test.each`
        text                                      | expected
        ${''}                                     | ${[]}
        ${'hello'}                                | ${[]}
        ${'caf\\xe9'}                             | ${[3, 3, 7, 4]}
        ${'caf\\u00e9'}                           | ${[3, 3, 9, 4]}
        ${'caf\\xe9 '}                            | ${[3, 3, 7, 4, 8, 5]}
        ${'\\u00e9 is an "e" with an accent "`"'} | ${[0, 0, 6, 1, 35, 30]}
        ${'hello\\x20there'}                      | ${[5, 5, 9, 6, 14, 11]}
        ${'hello\\u0020there'}                    | ${[5, 5, 11, 6, 16, 11]}
        ${'hello\\u{020}there'}                   | ${[5, 5, 12, 6, 17, 11]}
    `('mapRawString map $# [$text]', ({ text, expected }) => {
        const r = mapRawString(text);
        expect(r.map).toEqual(expected);
    });
});

function toCharCodes(s: string): string {
    return s
        .split('')
        .map((a) => ('000' + a.charCodeAt(0).toString(16)).slice(-4))
        .join(', ');
}
