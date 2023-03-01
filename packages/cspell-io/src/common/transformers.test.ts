import { describe, expect, test } from 'vitest';

import { encodeUtf16BE, encodeUtf16LE } from './encode-decode';
import { createDecoderTransformer, encoderTransformer } from './transformers';

const eBE = encodeUtf16BE;
const eLE = encodeUtf16LE;

const T = true;
const F = false;

const decoderUtf = createDecoderTransformer();

describe('transformUtf16', () => {
    test.each`
        values                                                             | expected
        ${[]}                                                              | ${[]}
        ${['hello', 'there', Buffer.from('again'), Buffer.from('?')]}      | ${['hello', 'there', 'again', '?']}
        ${[eLE('hello', T), eLE('there', F), eLE('again', F)]}             | ${['hello', 'there', 'again']}
        ${[eLE('hello', T), eLE('there', F), eLE('again', T)]}             | ${['hello', 'there', 'again']}
        ${[eBE('hello', T), eBE('there', F), eBE('again', F)]}             | ${['hello', 'there', 'again']}
        ${[eBE('hello', T), eBE('there', F), eBE('again', T)]}             | ${['hello', 'there', 'again']}
        ${encoderTransformer('hello|there|again|?'.split('|'), 'utf8')}    | ${['hello', 'there', 'again', '?']}
        ${encoderTransformer('hello|there|again|?'.split('|'), 'utf16le')} | ${['hello', 'there', 'again', '?']}
        ${encoderTransformer('hello|there|again|?'.split('|'), 'utf16be')} | ${['hello', 'there', 'again', '?']}
    `('transformUtf16 $values', async ({ values, expected }) => {
        expect(await toArray(decoderUtf(values))).toEqual(expected);
    });

    // cspell:ignore 5IAGEAcABwAHkAIABOAGUAdwAgAFkAZQBhAHIA
    test.each`
        str                                           | encoding     | decoding     | expected
        ${''}                                         | ${undefined} | ${undefined} | ${''}
        ${'Happy New Year'}                           | ${'utf8'}    | ${undefined} | ${'Happy New Year'}
        ${'1|2| |3|4'}                                | ${'utf8'}    | ${'hex'}     | ${'31|32|20|33|34'}
        ${'1|2| |3|4'}                                | ${'utf16le'} | ${'hex'}     | ${'fffe3100|3200|2000|3300|3400'}
        ${'1|2| |3|4'}                                | ${'utf16be'} | ${'hex'}     | ${'feff0031|0032|0020|0033|0034'}
        ${'Happy New Year'}                           | ${undefined} | ${'base64'}  | ${'SGFwcHkgTmV3IFllYXI='}
        ${'SGFwcHkgTmV3IFllYXI='}                     | ${'base64'}  | ${undefined} | ${'Happy New Year'}
        ${'feff0031|0032|0020|0033|0034'}             | ${'hex'}     | ${'hex'}     | ${'feff0031|0032|0020|0033|0034'}
        ${'fffe3100|3200|2000|3300|3400'}             | ${'hex'}     | ${'utf16le'} | ${'1|2| |3|4'}
        ${'feff0031|0032|0020|0033|0034'}             | ${'hex'}     | ${'utf16be'} | ${'1|2| |3|4'}
        ${'Happy New Year'}                           | ${'utf16le'} | ${'base64'}  | ${'//5IAGEAcABwAHkAIABOAGUAdwAgAFkAZQBhAHIA'}
        ${'//5IAGEAcABwAHkAIABOAGUAdwAgAFkAZQBhAHIA'} | ${'base64'}  | ${'utf16le'} | ${'Happy New Year'}
    `('transformUtf16 $str, $encoding, $decoding', async ({ str, encoding, decoding, expected }) => {
        const decoder = createDecoderTransformer(decoding);
        const stream = encoderTransformer(str.split('|'), encoding);
        expect(await (await toArray(decoder(stream))).join('|')).toEqual(expected);
        const asAsync = toAsync<string>(str.split('|'));
        const streamAsync = encoderTransformer(asAsync, encoding);
        expect(await (await toArray(decoder(streamAsync))).join('|')).toEqual(expected);
    });
});

async function toArray<T>(iter: AsyncIterable<T> | Iterable<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const value of iter) {
        arr.push(value);
    }
    return arr;
}

async function* toAsync<T>(iter: AsyncIterable<T> | Iterable<T>): AsyncIterable<T> {
    yield* iter;
}
